import type { Campaign } from '../types/campaign'
import type { BizType } from '../types/shop'

/**
 * Fallback campaigns when Live AI fails or is disabled.
 * Spec §8.5 — judges may include Chinese/Korean speakers, hand-translated to avoid Google Translate quality.
 */
export const MOCK_CAMPAIGNS: Record<BizType, Campaign> = {
  Cafe: {
    chosen: 'bundle',
    name: 'Pearl Power Hour',
    tag: 'Cool. Chewy. Made for the afternoon.',
    offer: 'Pearl milk tea + brown sugar boba — $9 from 2–4pm. CatWalk walkers from Chatswood Station get an extra 1× pts.',
    why: 'Afternoon slump pulls commuters indoor; 11 cafés within 700m means a plain discount is invisible. A signature bubble tea bundle wins the moment without bleeding margin. Bilingual signage matches the local Chinese-speaking community for extra reach.',
    visionRead: 'Brown sugar pearl milk tea with thick syrup streaks and chewy tapioca pearls in a clear cup, photographed against a wooden counter.',
    signals: [
      { name: 'Afternoon · 2–4pm',       impact: 'Sweet + cold offers convert 2.1× better than morning hours' },
      { name: 'Chinese New Year nearby', impact: 'Festive bundle aligns with local community celebrations · +28% Asian-cuisine lift' },
      { name: 'Concourse foot traffic',  impact: '~600 walk-bys 1–5pm; pearl tea is a known impulse purchase' },
      { name: '11 cafés / 700m',         impact: 'Plain discount is noise — a signature bundle creates a reason to walk in' },
      { name: 'Korean + Chinese',        impact: '8% Korean, 40% Chinese ancestry — trilingual signs unlock latent demand' },
    ],
    revenue: 260,
    orders: 22,
    avg: 11.8,
    score: 84,
    windowText: '2:00 – 4:00 PM',
    assets: {
      ig: {
        en: '🧋 Afternoon Pearl Power Hour — pearl milk tea + brown sugar boba for $9 from 2–4pm. Cool. Chewy. Made for the afternoon. CatWalk walkers from Chatswood Station earn extra Catto points. ☕✨\n\n#chatswoodbubbletea #pearlpower #catwalk #willoughbylocal',
        zh: '🧋 下午来一杯珍珠奶茶 + 黑糖珍珠，$9（2–4pm 限定）。冰凉、Q弹，午后正好。从 Chatswood 车站走过来，还能多拿 Catto 积分哦！✨\n\n#查茨伍德珍珠奶茶 #珍珠时光 #猫咪指南',
        ko: '🧋 오후 펄 파워 아워 — 펄밀크티 + 흑당버블 $9 (오후 2–4시). 시원하고, 쫄깃하고, 오후에 딱! 차츠우드 역에서 걸어오시면 캐토 포인트도 추가로 적립! ✨\n\n#차츠우드버블티 #펄파워 #캐토컴퍼스',
      },
      google: {
        en: 'Today only · 2–4pm: Pearl Power Hour. Pearl milk tea + brown sugar boba $9. Walk-in special. CatWalk walkers earn 2× points.',
        zh: '今日限定 · 2–4pm：珍珠下午茶时光。珍珠奶茶 + 黑糖珍珠 $9。仅限堂食。CatWalk 步行用户积分翻倍。',
        ko: '오늘 한정 · 오후 2–4시: 펄 파워 아워. 펄밀크티 + 흑당버블 $9. 매장 한정. 캐토 컴퍼스 도보 방문 시 포인트 2배.',
      },
      sign: {
        en: { big: 'Pearl Power Hour', sub: '2–4 PM · Pearl Milk Tea + Brown Sugar Boba · $9' },
        zh: { big: '珍珠下午茶时光',    sub: '2–4 PM · 珍珠奶茶 + 黑糖珍珠 · $9' },
        ko: { big: '펄 파워 아워',      sub: '2–4 PM · 펄밀크티 + 흑당버블 · $9' },
      },
      script: {
        en: 'Hey, in for an arvo pick-me-up? Pearl Power Hour is on — pearl milk tea plus brown sugar boba for nine dollars, usually twelve. Cool, chewy, fast. Five minutes and you\'re out the door.',
        zh: '想下午来杯提神的吗？现在是珍珠下午茶时光——珍珠奶茶加黑糖珍珠只要 $9，原价 $12。冰凉、Q 弹、出杯快，五分钟搞定。',
        ko: '오후에 한 잔 어떠세요? 지금 펄 파워 아워 진행 중! 펄밀크티 + 흑당버블 $9, 평소엔 $12. 시원하고 쫄깃하고, 5분이면 나가실 수 있어요.',
      },
      plan: {
        en: [
          '1:50 PM — Brew fresh black tea base + boil brown sugar syrup for 24 cups.',
          '1:55 PM — Place A4 sign at counter; post Google Business update from phone.',
          '2:00 PM — Open. Greet first 3 walk-ins with Pearl Power line from staff script.',
          '2:30 PM — Quick check: tapioca pearl batch + boba syrup level. Re-cook pearls if needed.',
          '3:30 PM — Last call message on the chalkboard: \'⏰ 30 min left\'.',
          '4:00 PM — Close offer, log sales count + walk-ins for CatWalk dashboard.',
        ],
        zh: [
          '1:50 PM — 准备 24 杯黑茶 base，熬煮黑糖糖浆。',
          '1:55 PM — 柜台摆放 A4 桌牌；从手机更新 Google 商家动态。',
          '2:00 PM — 开场。前 3 位客人用员工脚本打招呼。',
          '2:30 PM — 快速盘点：珍珠和黑糖糖浆。需要的话再煮一批珍珠。',
          '3:30 PM — 黑板写上\'⏰ 还剩 30 分钟\'。',
          '4:00 PM — 结束促销，记录销量和到店人数到 CatWalk。',
        ],
        ko: [
          '1:50 PM — 홍차 베이스 24잔 분량 준비, 흑당 시럽 끓이기.',
          '1:55 PM — 카운터에 A4 안내판; 휴대폰으로 구글 비즈니스 게시.',
          '2:00 PM — 오픈. 첫 손님 3명에게 스크립트 인사.',
          '2:30 PM — 빠른 점검: 타피오카 펄 배치, 흑당 시럽 잔량. 필요시 펄 재조리.',
          '3:30 PM — 칠판에 \'⏰ 30분 남음\' 표시.',
          '4:00 PM — 프로모션 종료, 판매량과 방문 수를 CatWalk에 기록.',
        ],
      },
    },
  },

  Restaurant: {
    chosen: 'traffic',
    name: 'Commuter Quick-Plate',
    tag: 'Off the platform, into your seat.',
    offer: 'Bibimbap + miso + drink — $14.90 from 5:30–7:30pm. Show the CatWalk walk-screen and skip the queue.',
    why: '~47.8K daily Opal taps (TfNSW monthly aggregate, cited). Evening commuters want fast, hot, filling — not a 45-min sit-down. A pre-plated set targets the 17:30–19:00 platform exit surge.',
    visionRead: 'Hot stone bibimbap with sizzling beef, vegetables and a runny egg yolk on top, served in a black ceramic dolsot.',
    signals: [
      { name: '50K daily Opal taps',     impact: '~7,500 evening commuters cross your block 5:30–7:30pm' },
      { name: '89 restaurants / 700m',   impact: 'Niche speed-format wins over generic discount' },
      { name: 'Korean + Chinese 48%',    impact: 'Native-language menu signs convert ~3× over English-only' },
      { name: 'Spring St boost · 3×',    impact: 'Catto walkers earn extra points for choosing your street' },
      { name: 'Wet weather window',      impact: 'Hot stone bowls sell 1.8× during rain vs sunny evenings' },
    ],
    revenue: 412,
    orders: 28,
    avg: 14.7,
    score: 79,
    windowText: '5:30 – 7:30 PM',
    assets: {
      ig: {
        en: '🍲 Off-the-train special: Bibimbap + miso + drink, $14.90, 5:30–7:30pm. Hot stone bowl, ready in 4 min. Show your Catto walk-screen, skip the queue.\n\n#chatswoodeats #commuterdinner #seoulbbq #catwalk',
        zh: '🍲 下班直达套餐：石锅拌饭 + 味噌 + 饮料，$14.90，5:30–7:30pm。热乎乎，4 分钟上桌。出示 Catto 步行屏幕免排队。\n\n#查茨伍德美食 #下班晚餐 #首尔烤肉',
        ko: '🍲 퇴근 후 빠른 한 그릇: 비빔밥 + 된장국 + 음료, $14.90, 5:30–7:30pm. 4분이면 식탁에. 캐토 워크 화면 보여주시면 줄 안 서도 됩니다.\n\n#차츠우드맛집 #퇴근저녁 #서울바비큐',
      },
      google: {
        en: 'Tonight 5:30–7:30pm: Commuter Quick-Plate. Bibimbap + miso + drink $14.90. Show CatWalk walk = skip queue.',
        zh: '今晚 5:30–7:30pm：下班快餐套餐。石锅拌饭+味噌+饮料 $14.90。出示 CatWalk 即可免排队。',
        ko: '오늘 저녁 5:30–7:30pm: 퇴근 빠른 한 그릇. 비빔밥+된장국+음료 $14.90. 캐토 컴퍼스 보여주면 줄 면제.',
      },
      sign: {
        en: { big: 'Commuter Quick-Plate', sub: '5:30–7:30 PM · Bibimbap Set · $14.90' },
        zh: { big: '下班快餐套餐',          sub: '5:30–7:30 PM · 石锅拌饭套餐 · $14.90' },
        ko: { big: '퇴근 빠른 한 그릇',     sub: '5:30–7:30 PM · 비빔밥 세트 · $14.90' },
      },
      script: {
        en: 'Just got off the train? Take a seat — 4 minutes flat. Bibimbap with miso and a drink is $14.90 today only, normally $19. Tablet or counter, your call.',
        zh: '刚下车吗？这边坐——4 分钟就好。石锅拌饭加味噌和饮料今天只要 $14.90，平时 $19。坐这里还是去柜台都行。',
        ko: '방금 내리셨어요? 여기 앉으세요 — 딱 4분이면 됩니다. 비빔밥에 된장국, 음료까지 오늘만 $14.90, 평소엔 $19. 테이블이나 카운터, 편하신 대로요.',
      },
      plan: {
        en: [
          '5:15 PM — Pre-heat 6 dolsot stones; pre-portion bibimbap veg into 6 trays.',
          '5:25 PM — Counter sign up; post Google Business update.',
          '5:30 PM — Open. First 3 walk-ins get welcome line.',
          '6:15 PM — Stone re-heat batch 2 (commuter peak hits 6:20–6:50).',
          '7:15 PM — Last-call message at the door.',
          '7:30 PM — Close offer; log Catto walk-ins.',
        ],
        zh: [
          '5:15 PM — 预热 6 个石锅，分装 6 份拌饭蔬菜。',
          '5:25 PM — 摆放柜台招牌；更新 Google 商家。',
          '5:30 PM — 开张。前 3 位用迎宾话术。',
          '6:15 PM — 第 2 轮石锅加热（高峰 6:20–6:50）。',
          '7:15 PM — 门口写上"最后召集"。',
          '7:30 PM — 结束促销，记录 Catto 步行客人数。',
        ],
        ko: [
          '5:15 PM — 돌솥 6개 예열, 비빔밥 채소 6세트 분량 준비.',
          '5:25 PM — 카운터 안내판 설치; 구글 비즈니스 업데이트.',
          '5:30 PM — 오픈. 첫 손님 3명에게 환영 멘트.',
          '6:15 PM — 돌솥 2차 예열 (피크 6:20–6:50).',
          '7:15 PM — 입구에 "마지막 주문" 안내.',
          '7:30 PM — 프로모션 종료, 캐토 도보 손님 기록.',
        ],
      },
    },
  },

  Bakery: {
    chosen: 'aware',
    name: 'Morning Pair-Up',
    tag: 'Pastry + coffee. The walk to the station starts here.',
    offer: 'Pastry + coffee = $7.50 from 7–10am. Show your CatWalk screen for double points.',
    why: 'Bakeries win the morning commute window. 50K Opal taps surge 7:00–9:30am. The pair-up beats coffee-shop margins by tying you to the station-arrival ritual.',
    visionRead: 'Golden butter pastry with visible flaky layers, fresh from the oven on a wooden board with a small dusting of sugar.',
    signals: [
      { name: 'Morning leverage 7–10am', impact: '~22,000 commuters in the morning surge window' },
      { name: '47 cafes / 700m',         impact: 'Pastry + coffee bundle differentiates from coffee-only competitors' },
      { name: 'Walk multiplier 2×',      impact: 'Locals 220m+ away earn double points to discover you' },
      { name: 'Fresh-baked timing',      impact: 'Pastries out of oven 6:50am hit the 7:10 train wave' },
      { name: 'Pacific Hwy traffic',     impact: 'Drivers parking on Victoria Ave grab a quick bag — display the takeaway combo at the door' },
    ],
    revenue: 192,
    orders: 26,
    avg: 7.4,
    score: 76,
    windowText: '7:00 – 10:00 AM',
    assets: {
      ig: {
        en: '🥐 Morning Pair-Up: pastry + coffee = $7.50 from 7–10am. Fresh-baked, ready as you walk to the platform. CatWalk walkers earn 2× points.\n\n#chatswoodbakery #morningfix #catwalk #willoughbylocal',
        zh: '🥐 早餐套餐：可颂 + 拿铁咖啡 = $7.50（7–10am）。刚出炉的酥皮可颂，赶车路上正好。Catto 步行用户积分翻倍！\n\n#查茨伍德烘焙 #早餐时光 #猫咪指南',
        ko: '🥐 모닝 페어업: 크루아상 + 플랫화이트 = $7.50 (7–10am). 갓 구운 크루아상, 출근길에 딱. 캐토 컴퍼스 도보 방문 시 포인트 2배!\n\n#차츠우드베이커리 #모닝커피 #캐토컴퍼스',
      },
      google: {
        en: 'Today 7–10am: Morning Pair-Up. Pastry + coffee $7.50. Fresh-baked, station-ready. CatWalk = 2× points.',
        zh: '今日 7–10am：早餐套餐。可颂 + 拿铁 $7.50。刚出炉，赶车正好。CatWalk 积分翻倍。',
        ko: '오늘 7–10am: 모닝 페어업. 크루아상 + 플랫화이트 $7.50. 갓 구워 출근길 딱. 캐토 컴퍼스 = 포인트 2배.',
      },
      sign: {
        en: { big: 'Morning Pair-Up', sub: '7–10 AM · Pastry + Coffee · $7.50' },
        zh: { big: '早餐套餐',          sub: '7–10 AM · 可颂 + 拿铁 · $7.50' },
        ko: { big: '모닝 페어업',       sub: '7–10 AM · 크루아상 + 플랫화이트 · $7.50' },
      },
      script: {
        en: 'Catching the train? Pastry just came out — pair it with a coffee, $7.50. Takeaway in 90 seconds, hot and flaky.',
        zh: '赶车吗？可颂刚出炉，配杯拿铁 $7.50。90 秒外带，又热又酥。',
        ko: '기차 타시러요? 크루아상 방금 나왔어요 — 플랫화이트랑 같이 $7.50. 90초 안에 따뜻하게 포장해 드릴게요.',
      },
      plan: {
        en: [
          '6:30 AM — First batch of pastries in oven (out at 6:50).',
          '6:55 AM — Counter sign + Google Business post.',
          '7:00 AM — Open. Pre-stage 6 takeaway bags at the door.',
          '7:45 AM — Second batch in (peak commuter wave 8:00–8:30).',
          '9:30 AM — Last-call sign at the door.',
          '10:00 AM — Close offer, log walk-ins for council dashboard.',
        ],
        zh: [
          '6:30 AM — 第一批可颂入炉（6:50 出炉）。',
          '6:55 AM — 摆放柜台招牌；发 Google 商家动态。',
          '7:00 AM — 开门。门口预备 6 个外带袋。',
          '7:45 AM — 第二批入炉（8:00–8:30 是高峰）。',
          '9:30 AM — 门口写"最后召集"。',
          '10:00 AM — 结束促销，记录到店人数。',
        ],
        ko: [
          '6:30 AM — 첫 번째 크루아상 굽기 (6:50에 완성).',
          '6:55 AM — 카운터 안내판; 구글 비즈니스 게시.',
          '7:00 AM — 오픈. 입구에 테이크아웃 봉투 6개 미리 준비.',
          '7:45 AM — 두 번째 굽기 시작 (피크 8:00–8:30).',
          '9:30 AM — 입구에 "마지막 주문" 안내.',
          '10:00 AM — 프로모션 종료, 방문 수 기록.',
        ],
      },
    },
  },
}
