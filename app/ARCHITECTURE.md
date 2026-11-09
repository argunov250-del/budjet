# Ровно — architecture (Expo SDK 58, RN 0.88, expo-router, Reanimated 4)

Routes live in `src/app` (SDK 58 default). Tabs: `src/app/(tabs)/{index,operations,ai,goals,analytics}.tsx` (one file per screen, currently placeholders). Root `_layout.tsx` loads Manrope, wraps SafeAreaProvider + ToastProvider. Tab layout uses `Tabs` from `expo-router/js-tabs` with `FloatingTabBar`.
Scripts: `npx tsc --noEmit`, `npx jest`, `CI=1 npx expo export --platform web`. EAS: `eas.json` profile `preview` (APK). Package `com.argunov.rovno`.
Note: `npx expo install` is blocked by the sandbox proxy; versions were pinned manually from `expo/bundledNativeModules.json`.

## theme (`src/theme`)
- `useTheme()` -> `{ isDark, colors, shadows }` (system scheme). `colors`: bg, shLight, shDark, navy (text), text2 (muted), accent, accent2, accentGlow, track, ink, inkText, ok, scrim, divider, barFrom, barTo.
- `shadows`: raised, raisedS, inset, insetS, sheet, pill, pillPressed, toast, avatar (RN `boxShadow` strings). `raised(colors,{radius,padding,small})`, `pressed(...)` return ViewStyle.
- `gradients` (ring, flame, avatar), `radii`, `spacing`, `MAX_WIDTH=420`, `fontFamily` (regular/medium/semibold/bold/extrabold = Manrope_*), `typography` presets (tabular-nums included).

## store (`src/store`, zustand persist key `rovno-store-v1`, version 2; `migrate` wipes pre-v2 demo state)
Empty by default (no seed). State: `accounts, categories(expense), transactions, goals, settings, lastAccountId`. `useHydrated()` gates root render; root `_layout` uses `Stack.Protected`: no accounts -> `onboarding`, else `(tabs)` + `settings`.
Actions: `addTransaction({kind?,amount,categoryId?,note,date?,accountId?,toAccountId?})` (accountId defaults to last used), `removeTransaction`, `addAccount/updateAccount/setAccountArchived`, `setCategoryLimit`, `addGoal`, `depositToGoal`, `updateSettings`, `replaceData` (import), `reset()` (-> empty).
Types: Account{id,name,type,initialBalance,color,icon(emoji),archived}, Transaction{kind:'expense'|'income'|'transfer',accountId,toAccountId?}, Settings{monthlyIncome,payday,fixedExpenses,monthlyBudget(0=income-fixed),theme}. `incomeCategories` const (not in state). `data.ts`: emptyData/sanitizeData/exportJson/parseImport/migrateState.
NOTE: `monthTransactions`/`spentOnDay`/`dailyLimit` count EXPENSES only; use `monthOps` for all kinds. `accountBalance`, `totalBalance` in logic.

## logic (`src/logic/budget.ts`, pure; every fn takes `now: Date`)
- `dailyLimit(txs, settings, now)` -> `{limit, base, savedYesterday, monthBudget, remaining, daysLeft, spentToday, leftToday}`; limit=(budget - spent before today)/daysLeft(incl. today); base = yesterday's limit; base+savedYesterday=limit.
- `spentToday`, `leftToday`, `spentOnDay`, `monthTransactions`, `monthBudget`, `daysInMonth`, `daysLeft`.
- `monthSeries` -> `{daysInMonth, cumulative[{day,value}], ideal[], total, idealToday, diff}` (diff>0 = under pace).
- `categorySpent(txs, categories, now)` -> `[{category, spent, ratio, over}]`.
- `streak(txs, settings, now)` days in a row spent <= that day's limit.
- `parseQuickInput("кофе 250, такси 480")` -> `[{note, amount, categoryId}]`; `categorize(note)`; keyword map `KEYWORDS`.

## components (`src/components`, import from `../components`)
- `Screen {children, style?, scroll=true}` bg + safe area + 16px gutter + 420 max + bottom space `TAB_BAR_SPACE` (120). Use as every screen root.
- `NeuCard {children, style?, onPress?, pressable?, radius=28, padding=18, small?}` raised; with onPress sinks (spring scale .975 + inset) + haptic.
- `NeuButton {title, onPress?, variant:'pill'|'neu'='pill', disabled?, full?, style?, textStyle?}`.
- `Chip {label, icon?: ReactNode, style?}` inset pill.
- `AnimatedNumber {value, duration=1200, prefix?, suffix?, style?, format?}` count-up, thin-space thousands (`formatNumber`, `formatRub` in `format.ts`; minus is U+2212).
- `Ring {progress 0..1, size=158, duration=1600, children}` gradient arc + knob; children centered.
- `ProgressBar {value 0..1, hot?(auto >=.85), height=8, delay?, style?}` animated; spring on change.
- `PaceChart {series: MonthSeries, ticks?: [day,label][], duration=1800}` aspect 320:150; step line draw, dotted ideal, pulsing dot + label.
- `BottomSheet {visible, onClose, children}` Modal, spring slide-up, scrim backdrop (blur on web).
- `ToastProvider` (root) + `useToast().show(msg, ms?)`.
- `FadeInUp {children, index=0 (delay=index*90ms), delay?, distance=22, style?}`.
- `Icon {name: IconName, size=24, color, strokeWidth=2}` (cart, kid, coffee, car, home, heart, ticket, repeat, tag, house, list, sparkles, target, bars, calendar, sun, check, plus); `Avatar {letter,size}`; `tap()/success()` haptics (no-op on web).
- `FloatingTabBar` (internal to tabs layout; 5 round buttons, spring-sliding inset indicator).
