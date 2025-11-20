# GitHub 및 Vercel 배포 가이드

## 📦 GitHub 저장소 생성 및 연결

### 1. GitHub에서 새 저장소 생성

1. https://github.com/new 접속
2. Repository name: `ai-book-smith` (또는 원하는 이름)
3. **Public** 또는 **Private** 선택
4. ⚠️ **"Initialize this repository with a README" 체크 해제** (이미 로컬에 코드가 있으므로)
5. "Create repository" 클릭

### 2. 로컬 저장소를 GitHub에 푸시

GitHub에서 저장소를 만든 후, 다음 명령어를 실행하세요:

```bash
# GitHub 저장소 URL로 변경하세요
git remote add origin https://github.com/YOUR_USERNAME/ai-book-smith.git

# 기본 브랜치를 main으로 설정
git branch -M main

# GitHub에 푸시
git push -u origin main
```

> **참고**: `YOUR_USERNAME`을 실제 GitHub 사용자명으로 변경하세요.

---

## 🚀 Vercel 배포

### 방법 1: Vercel 웹사이트에서 배포 (추천)

1. **Vercel 로그인**
   - https://vercel.com 접속
   - GitHub 계정으로 로그인

2. **새 프로젝트 생성**
   - "Add New..." → "Project" 클릭
   - GitHub 저장소 목록에서 `ai-book-smith` 선택
   - "Import" 클릭

3. **환경 변수 설정** (중요!)
   - "Environment Variables" 섹션에서:
     - Name: `GEMINI_API_KEY`
     - Value: 실제 Gemini API 키 입력
   - "Add" 클릭

4. **배포**
   - "Deploy" 클릭
   - 몇 분 후 배포 완료!

### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치 (전역)
npm install -g vercel

# Vercel 로그인
vercel login

# 프로젝트 배포
vercel

# 환경 변수 추가
vercel env add GEMINI_API_KEY

# 프로덕션 배포
vercel --prod
```

---

## ⚙️ 환경 변수 설정 (Vercel)

배포 후 환경 변수를 추가하려면:

1. Vercel 대시보드에서 프로젝트 선택
2. "Settings" → "Environment Variables" 이동
3. 다음 변수 추가:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: 실제 API 키
   - **Environments**: Production, Preview, Development 모두 선택
4. "Save" 클릭
5. "Redeploy" 필요 (자동으로 재배포됨)

---

## 🔄 자동 배포 설정

Vercel은 GitHub와 연결되면 자동으로:
- ✅ `main` 브랜치에 푸시할 때마다 프로덕션 배포
- ✅ Pull Request 생성 시 프리뷰 배포
- ✅ 빌드 상태를 GitHub에 자동 보고

---

## 📝 배포 후 확인사항

- [ ] Vercel 대시보드에서 배포 상태 확인
- [ ] 배포된 URL 접속하여 앱 동작 확인
- [ ] 환경 변수가 제대로 설정되었는지 확인
- [ ] API 호출이 정상 작동하는지 테스트

---

## 🛠️ 문제 해결

### 빌드 실패 시
- Vercel 대시보드의 "Deployments" → 실패한 배포 클릭
- 빌드 로그 확인
- 주로 환경 변수 누락이 원인

### API 호출 실패 시
- 환경 변수 `GEMINI_API_KEY`가 설정되었는지 확인
- Vercel 대시보드에서 "Redeploy" 클릭

---

## 🎉 완료!

이제 다음 URL에서 앱에 접근할 수 있습니다:
- **프로덕션**: `https://your-project.vercel.app`
- **커스텀 도메인**: Vercel 설정에서 추가 가능
