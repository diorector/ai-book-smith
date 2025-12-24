from __future__ import annotations

import sys
from pathlib import Path
import zipfile


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python scripts/check_docx_no_afchunk.py path/to/file.docx", file=sys.stderr)
        raise SystemExit(2)

    path = Path(sys.argv[1])
    if not path.exists():
        print(f"File not found: {path}", file=sys.stderr)
        raise SystemExit(2)

    with zipfile.ZipFile(path, "r") as zf:
        names = zf.namelist()
        afchunks = [n for n in names if n.startswith("word/afchunk")]
        print(f"[CHECK] {path.name}")
        print(f"- afchunk parts: {len(afchunks)}")
        if afchunks:
            for n in afchunks[:20]:
                print(f"  - {n}")
            print("[FAIL] afchunk detected (AltChunk/MHTML/HTML embedded).")
            raise SystemExit(1)

        doc_xml = "word/document.xml"
        if doc_xml not in names:
            print("[WARN] word/document.xml not found")
            raise SystemExit(1)

        data = zf.read(doc_xml)
        has_wt = b"<w:t" in data
        print(f"- document.xml has <w:t>: {has_wt}")
        if not has_wt:
            print("[FAIL] No <w:t> text runs detected.")
            raise SystemExit(1)

    print("[OK] No afchunk found and document.xml contains text runs.")


if __name__ == "__main__":
    main()


