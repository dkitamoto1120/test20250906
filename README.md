# WHT Invoice Calculator

ベンダー受取額と発注者支払額を相互に計算しつつ、源泉税・消費税を逆算するツールです。

## 追加URLパラメータ

- `f` : Candexフィー率(%)。`f=3` など。1以下の値は小数として解釈。
- `exempt` : 免税フラグ。`1` でON。ON時はフィーを自動で2%に設定。
- `fpayer` : 手数料負担者。`vendor` または `buyer`。

従来の `n, w, c, base, round, two` も利用できます。

`n` は Vendor Gets（税抜）を表します。

## 相互計算ロジック

- Vendor負担: `VendorGets = YouPaid × (1 - feeRate)`
- Vendor負担で逆算: `YouPaid = VendorGets ÷ (1 - feeRate)`
- Buyer負担: `VendorGets = YouPaid`
- Buyer負担で逆算: `YouPaid = VendorGets × (1 + feeRate)`

`feeRate` はパーセント値を100で割った小数。丸めは `round` パラメータに従います。

## 免税トグルの挙動

「免税業者なら2%にセット」をONにするとフィー率が自動で2%になります。ONのままでも手動で上書き可能です。
