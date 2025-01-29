
- [x] 文字修正
	- [x] SinglePlayのとき*AI Win*ではなくYou Loseにするべき
	- [x] Your ColorはSinglePlayのみ、というかSinglePlayならランダム固定にすべきか
		- [x] Your Color：Black（first）
		- [x] Your Color：White（second）
	- [x] Turn表示の白黒駒を You/AIのところに移動
- [ ] Ai Customize
	- [ ] Ai先読み向上
	- [ ] 序盤はより良い場所をとるために手を進める
	- [ ] 最終ターンを取れるように：終盤は偶数理論
		- 終盤の残りのマスが２ヶ所など偶数なら相手に置かせて、３ヶ所など奇数なら自分が置けるように持っていく
	- [ ] 相手に囲ませる
	- [ ] 保留：自分にとって良い手だが相手はこの良い手に干渉できないので、まだ取らなくてもいい
		- [ ] 良い手に対し、「そのマスを相手が埋められるか」「そのマスを取ったときの価値を下げられるか」を判定
		- [ ] 自分が今回打つ手がそれを邪魔しないか
- [ ] 戦績記録
	- [ ] 保存
	- [ ] 表示
- [ ] モード
	- [ ] ハンデキャップhandicap　https://ja.wikipedia.org/wiki/オセロ_(ボードゲーム)#ハンデキャップ
	- [ ] ~~Board Sizeをコンフィグに移動~~
		- [ ] 奇数ボードは設定で許可しないとコンフィグできんように
	- [x] Board SizeとAILVをスライダーにする
- [ ] favison：crossの初期配置４駒
- [ ] 棋譜履歴
	- [x] 未来の棋譜と違う手が打たれるまで記録は保存
	- [ ] ctrl+z、ctrl+shift+z/ctrl+y
	- [ ] 横スクロール：ホイール
	- [ ] アニメーション（履歴）：駒を置く前←→駒を置いた後
	- [ ] タイムラインを逆にする
		- [ ] 最初 一つ戻る 再生 一つ進む 最後
- [ ] 設定
	- [ ] リバースアニメーション（ボード）：駒を置く前←→駒を置いた後
	- [ ] ガイド（打てるマス）のON・OFF
	- [x] 音量調整
- [ ] キーボード操作
	- [ ] Tab active style
	- [x] ~~esc~~BkspでbacktoTopのmodalを開く
	- [ ] 隠しコマンド
		- [x] デバッグモード・オンオフ:ctrl+d

マス統計
例えばA3を打ったとき勝率はどれくらいだったのか、全ての駒を調べデータ化する

|   | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| 1 |   |   |   |   |   |   |   |   |
| 2 |   |   |   |   |   |   |   |   |
| 3 |   |   |   |   |   |   |   |   |
| 4 |   |   |   | w | b |   |   |   |
| 5 |   |   |   |   |   |   |   |   |
| 6 |   |   |   |   |   |   |   |   |
| 7 |   |   |   |   |   |   |   |   |
| 8 |   |   |   |   |   |   |   |   |

- $aiTurn
	- ai_nextHand
		- getHands
			- getHand
				- getScore
					- logging
					- hit
						- $setTile(this.sym, x, y)
						- _changeRespectiveTiles(this.sym, x, y)
						- countIncr()
						- _checkSlots
					- reset
	- return Hand
