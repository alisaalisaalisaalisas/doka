import re
txt=open('docs/21-playground/scenarios-base.js',encoding='utf-8').read()
for sid in ["crashloop","jq-audit","pg-conflict","registry-push","tf-drift"]:
    idx=txt.find(f'"{sid}"')
    snippet=txt[idx: idx+8000]
    has_sol="solutionFiles" in snippet[:7000]
    print(f"{sid}: snippet len {len(snippet)} has_sol {has_sol}")
    if has_sol:
        s=snippet.find("solutionFiles")
        print(snippet[max(0,s-200):s+400].replace("\n","\\n")[:800])
    else:
        # print around checks
        c=snippet.find("checks:")
        print(snippet[c-200:c+800].replace("\n","\\n")[:1000])
    print("===")

# also check ml1b
txt2=open('docs/21-playground/scenarios-mlops.js',encoding='utf-8').read()
idx=txt2.find('"ml1b"')
snippet=txt2[idx: idx+8000]
print("ml1b has solutionFiles", "solutionFiles" in snippet[:7000])
