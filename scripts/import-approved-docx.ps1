param(
  [Parameter(Mandatory=$true)][string]$SourceDocx,
  [Parameter(Mandatory=$true)][string]$OutputDirectory,
  [Parameter(Mandatory=$true)][string]$MetadataFile
)
$ErrorActionPreference='Stop'
if (!(Test-Path -LiteralPath $SourceDocx -PathType Leaf)) { throw 'Approved DOCX does not exist.' }
if (!(Test-Path -LiteralPath $MetadataFile -PathType Leaf)) { throw 'Metadata file does not exist.' }
$meta=Get-Content -LiteralPath $MetadataFile -Raw|ConvertFrom-Json
if (!$meta.article_key -or !$meta.baseline_key -or !$meta.PSObject.Properties['heading_paragraphs'] -or !$meta.expected_table_count) { throw 'Metadata must declare article_key, baseline_key, heading_paragraphs, and expected_table_count.' }
New-Item -ItemType Directory -Force -Path $OutputDirectory|Out-Null
$htmlPath=Join-Path $OutputDirectory ($meta.baseline_key+'.html')
$manifestPath=Join-Path $OutputDirectory ($meta.baseline_key+'.validation.json')
Remove-Item -LiteralPath $htmlPath,$manifestPath -Force -ErrorAction SilentlyContinue
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip=[IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $SourceDocx))
try {
  $entry=$zip.GetEntry('word/document.xml'); if (!$entry) { throw 'DOCX document.xml is missing.' }
  $reader=[IO.StreamReader]::new($entry.Open()); [xml]$xml=$reader.ReadToEnd(); $reader.Close()
  $ns=[Xml.XmlNamespaceManager]::new($xml.NameTable);$ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
  $paragraphs=@();$tables=@();$html='';$paragraphIndex=0
  foreach($node in $xml.SelectNodes('//w:body/w:*',$ns)) {
    if($node.LocalName -eq 'p') {
      $paragraphIndex++;$parts=@();foreach($run in $node.SelectNodes('.//w:r',$ns)) { $text=(($run.SelectNodes('.//w:t',$ns)|% InnerText)-join ''); if($text) { $escaped=[Security.SecurityElement]::Escape($text);if($run.SelectSingleNode('./w:rPr/w:b',$ns)){$escaped="<strong>$escaped</strong>"};if($run.SelectSingleNode('./w:rPr/w:i',$ns)){$escaped="<em>$escaped</em>"};$parts+=$escaped } }
      $content=$parts -join '';if(!$content){continue};$paragraphs+=[Security.SecurityElement]::Escape((($node.SelectNodes('.//w:t',$ns)|% InnerText)-join ''))
      $tag=if($paragraphIndex -eq 1){'h1'}elseif($meta.heading_paragraphs -contains $paragraphIndex){'h2'}else{'p'};$html+="<$tag>$content</$tag>"
    } elseif($node.LocalName -eq 'tbl') {
      $grid=@();$html+='<div class="article-table-scroll"><table><tbody>';foreach($row in $node.SelectNodes('./w:tr',$ns)){$cells=@();$html+='<tr>';foreach($cell in $row.SelectNodes('./w:tc',$ns)){$value=(($cell.SelectNodes('.//w:t',$ns)|% InnerText)-join '');$cells+=$value;$html+='<td>'+[Security.SecurityElement]::Escape($value)+'</td>'};$grid+=,@($cells);$html+='</tr>'};$html+='</tbody></table></div>';$tables+=,@($grid)
    } elseif($node.LocalName -ne 'sectPr') { throw "Unsupported Word body structure: $($node.LocalName)." }
  }
  if($tables.Count -ne $meta.expected_table_count){throw "Expected $($meta.expected_table_count) tables; found $($tables.Count)."}
  foreach($price in @($meta.required_prices)){if(!$html.Contains($price)){throw "Required approved price missing: $price"}}
  foreach($grid in $tables) { foreach($row in $grid) { if($row.Count -lt 2){throw 'Table row has fewer than two cells.'} } }
  $tempHtml="$htmlPath.tmp";$tempManifest="$manifestPath.tmp";$utf8=[Text.UTF8Encoding]::new($false)
  [IO.File]::WriteAllText($tempHtml,$html,$utf8)
  $hash=([Security.Cryptography.SHA256]::Create().ComputeHash([IO.File]::ReadAllBytes($tempHtml))|% ToString x2)-join ''
  $manifest=[ordered]@{baseline_key=$meta.baseline_key;article_key=$meta.article_key;source_filename=(Split-Path $SourceDocx -Leaf);sha256=$hash;paragraphs=$paragraphs;tables=$tables;preview=$meta.preview;hyperlink_destinations='ignored'}|ConvertTo-Json -Depth 12
  [IO.File]::WriteAllText($tempManifest,$manifest,$utf8)
  Move-Item -LiteralPath $tempHtml -Destination $htmlPath -Force;Move-Item -LiteralPath $tempManifest -Destination $manifestPath -Force
} finally {$zip.Dispose()}
