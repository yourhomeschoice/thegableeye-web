param([Parameter(Mandatory=$true)][string]$Path)
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip=[IO.Compression.ZipFile]::OpenRead((Resolve-Path $Path))
try {
  $entry=$zip.GetEntry('word/document.xml');$reader=[IO.StreamReader]::new($entry.Open());[xml]$xml=$reader.ReadToEnd();$reader.Close()
  $ns=[Xml.XmlNamespaceManager]::new($xml.NameTable);$ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
  $paragraphs=@();$tables=@()
  foreach($node in $xml.SelectNodes('//w:body/w:*',$ns)) {
    if($node.LocalName -eq 'p') {$text=(($node.SelectNodes('.//w:t',$ns)|% InnerText)-join '');if($text){$paragraphs+=$text}}
    elseif($node.LocalName -eq 'tbl') {$rows=@();foreach($row in $node.SelectNodes('./w:tr',$ns)){$cells=@();foreach($cell in $row.SelectNodes('./w:tc',$ns)){$cells+=((($cell.SelectNodes('.//w:t',$ns)|% InnerText)-join ''))};$rows+=,@($cells)};$tables+=,@($rows)}
  }
  @{paragraphs=$paragraphs;tables=$tables}|ConvertTo-Json -Depth 8 -Compress
} finally {$zip.Dispose()}
