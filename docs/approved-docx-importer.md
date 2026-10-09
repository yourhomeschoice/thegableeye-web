# Approved DOCX importer

Run `powershell -ExecutionPolicy Bypass -File scripts/import-approved-docx.ps1 -SourceDocx "D:\Affliliate\Article Prompt and Source\EBS-007 - Coffee Espresso Machine.docx" -OutputDirectory publication-artifacts -MetadataFile publication-artifacts/ebs-007-import.json`.

The metadata file is required and must name the baseline/article identities, explicit heading paragraph positions where Word styles are ambiguous, and specimen price checks. The command emits immutable HTML plus a fidelity manifest and fails for missing source/metadata, unsupported body content, missing required prices, or a table count other than two.
