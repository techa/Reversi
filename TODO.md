
- [ ] Ai Customize
	- [ ] Ai先読み向上
	- [ ] 最終ターンを取れるように：終盤は偶数理論
		- 終盤の残りのマスが２ヶ所など偶数なら相手に置かせて、３ヶ所など奇数なら自分が置けるように持っていく
	- [ ] 相手に囲ませる
- [ ] 戦績記録
	- [ ] 保存
	- [ ] 表示
- [x] Board SizeとAILVをスライダーにする
	- [ ] 不正な値のときエラーを出してGameを開始できなくする
- [ ] favison：crossの初期配置４駒
- [ ] 棋譜履歴
	- [ ] 未来の棋譜と違う手が打たれるまで記録は保存
	- [ ] 横スクロール：ホイール
	- [ ] アニメーション（履歴）：駒を置く前←→駒を置いた後
- [ ] 新設定＆機能
	- [ ] アニメーション（ボード）：駒を置く前←→駒を置いた後


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