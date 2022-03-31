'''파일 검사하면 알아서 주민번호 마스킹(웹/앱 모듈 테스트용)'''

import re  # 정규식 사용
import shutil  # 셸 유틸리티
import json #json 임포트

# 어떤 파일 열지 입력 (json으로 받아오기)
# json 파일 이름: example
with open('./views/example.json') as json_file:
    json_data = json.load(json_file)
    # key가 json_title인 문자열 가져오기 (json_title: 검사 파일 이름)
    title = json_data["json_title"]
    print(title)
    # 확장자명(fileType)과 순수 파일명(fileTitle)으로 나누기
    fileTitle = title.split('.')[0]
    fileType = title.split('.')[1]
    print(fileTitle)
    print(fileType)

# 복사
shutil.copy(fileTitle+'.'+fileType, fileTitle + '(masked).' + fileType)


# 복사한 파일 이름을 매개변수에 저장     
fname = fileTitle + '(masked).' + fileType

# 읽기 모드에서 파일 열고 내용을 목록으로 복사하기
with open(fname, 'r', encoding='UTF8') as f:
    newline=[]
    for Word in f.readlines():
        
        #주민번호 패턴 탐지
        patternID = re.compile("(?P<birth>\d{6})[-](?P<maskID>\d{7})")
        msgID = patternID.search(Word)

        # 주민번호 패턴일 때
        if msgID:
            print(patternID.sub("\g<birth>-*******", msgID.group()))
            newline.append(Word.replace(msgID.group(), patternID.sub("\g<birth>-*******", msgID.group())))
        else :
            newline.append(Word)
        

# 쓰기 모드에서 파일 열고 업데이트 된 데이터 파일에 쓰기
with open(fname, 'w', encoding='UTF8') as f:
    for line in newline:
        f.writelines(line)


# 참고 사이트
# https://www.it-swarm.dev/ko/python/python%EC%97%90%EC%84%9C-%ED%85%8D%EC%8A%A4%ED%8A%B8-%ED%8C%8C%EC%9D%BC%EC%9D%98-%ED%8A%B9%EC%A0%95-%EC%A4%84-%ED%8E%B8%EC%A7%91/971925982/
# https://twpower.github.io/140-parsing-json-in-python
