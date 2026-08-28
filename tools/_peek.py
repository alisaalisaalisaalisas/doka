import sys

src = open("docs/21-playground/scenarios-base.js", encoding="utf-8").read()
i = src.find("containerPort: 8080")
print("crashloop:", repr(src[i:i+220]))
i = src.find("ENTRYPOINT")
print("registry:", repr(src[i:i+80]))
i = src.find('server_name.id}')
print("tf:", repr(src[i:i+80]))
src2 = open("docs/21-playground/scenarios-mlops.js", encoding="utf-8").read()
i = src2.find("5000:5000")
print("ml1b:", repr(src2[i:i+80]))
