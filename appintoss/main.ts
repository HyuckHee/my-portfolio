/**
 * 미니앱 엔트리.
 * 실제 셸은 `src/game-toss/`에 있다 — index.html이 root(appintoss/) 밖의 경로를 직접
 * 가리키면 dev 서버가 404를 내므로, root 안의 이 파일이 한 번 거쳐 준다.
 */
import '../src/game-toss/main';
