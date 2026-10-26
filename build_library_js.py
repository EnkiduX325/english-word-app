# -*- coding: utf-8 -*-
"""
build_library_js.py
阶段1 数据加载脚本：final_library_12000.csv -> library.js
- 必须用 csv 模块解析（禁止 split(',')）
- 输出内容: window.WORDS = [{w,t,p},...]
- 不改动、不重新筛选 final_library_12000.csv（只读）
"""
import csv
import json
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

SRC = "final_library_12000.csv"   # 与脚本同目录（项目根目录）
OUT = "library.js"
EXPECT_COUNT = 12000


def main():
    words = []
    with open(SRC, encoding="utf-8-sig", newline="") as f:  # utf-8-sig 自动去掉 BOM
        reader = csv.DictReader(f)
        for row in reader:
            w = (row.get("word") or "").strip()
            t = (row.get("translation") or "").strip()
            p = (row.get("phonetic") or "").strip()
            if not w or not t:
                sys.exit("中止：发现空 word/translation -> word=%r translation=%r" % (w, t))
            words.append({"w": w, "t": t, "p": p})

    if len(words) != EXPECT_COUNT:
        sys.exit("中止：词条数应为 %d，实际 %d" % (EXPECT_COUNT, len(words)))

    # 防呆检查（只检查，不修改数据）：word 不得重复
    ws = [x["w"] for x in words]
    if len(ws) != len(set(ws)):
        sys.exit("中止：发现重复 word")

    # JSON 即合法 JS 字面量，json.dumps 负责转义引号/反斜杠等
    body = ",\n".join(
        json.dumps(x, ensure_ascii=False, separators=(",", ":")) for x in words
    )
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write("window.WORDS = [\n" + body + "\n];\n")

    print("生成完成: %s | 共 %d 词 | 首条 %r | 末条 %r" % (OUT, len(words), words[0], words[-1]))


if __name__ == "__main__":
    main()
