import re
txt=open('docs/21-playground/scenarios-base.js',encoding='utf-8').read()
for sid in ["crashloop","jq-audit","pg-conflict","registry-push","tf-drift"]:
    idx=txt.find(f'"{sid}"')
    snippet=txt[idx: idx+4000]
    has_sol="solutionFiles" in snippet[:2500]
    has_files="files:" in snippet
    print(f"{sid}: has_solutionFiles={has_sol} has_files={has_files}")
    # print snippet around solutionFiles
    if has_sol:
        # find solutionFiles
        s=snippet.find("solutionFiles")
        print(snippet[s-100:s+300].replace("\n","\\n")[:500])
    print("---")
