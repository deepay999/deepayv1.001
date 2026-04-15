# DeePay — Payment IPN & Troubleshooting

---

## 1. How payment callbacks (IPN) work

```
User → Payment Page → Gateway → Gateway Server
                                      │
                    ┌─────────────────┘
                    ↓
          POST https://deepay.srl/ipn/{GatewayAlias}
                    │
          ProcessController::ipn()
                    │
          ├─ Verify signature
          ├─ Find matching Deposit
          ├─ Check amount match
          └─ PaymentController::userDataUpdate($deposit)
```

---

## 2. Alipay IPN

### Callback URLs

| Type | URL |
|---|---|
| IPN (async) | `https://deepay.srl/ipn/Alipay` |
| Return URL (sync redirect) | `https://deepay.srl/ipn/Alipay?type=return` |

### How to configure in Alipay Open Platform

1. Log in to [open.alipay.com](https://open.alipay.com)
2. Go to your application → **Setting** → **Notification URL**
3. Set the **Server URL** to `https://deepay.srl/ipn/Alipay`

### Trace-ID in logs

Every IPN call generates a `trace_id` (UUID). All log lines for the same call share the same trace_id — search for it in Laravel logs:

```
storage/logs/laravel.log
```

Example log entry:
```
[ERROR] Alipay IPN: signature verification failed {"trace_id":"uuid-...","trx":"DEP20240101","trade_status":"TRADE_SUCCESS"}
```

### Common Alipay IPN errors

| Symptom | Root cause | Fix |
|---|---|---|
| Log shows "signature verification failed" | Wrong `alipay_public_key` in gateway config | Copy the correct **Alipay** public key (not your app key) from the Alipay dashboard |
| Log shows "missing required fields" | Request did not include `sign` or `out_trade_no` | Check Alipay is calling the correct IPN URL |
| IPN 500 error | `open_basedir` PHP config issue | Run `sudo bash deploy/fix-server.sh` |
| IPN returns `fail` (never `success`) | Amount mismatch between IPN and Deposit | Check `final_amount` stored in Deposit vs `total_amount` in IPN params; ensure matching decimal format |
| No IPN at all | Alipay server cannot reach the URL | Ensure `/ipn/Alipay` is publicly accessible; test with `curl -X POST https://deepay.srl/ipn/Alipay` |

### Triggering manual reconciliation

```bash
# Check all uninitiated Alipay deposits from the last 24 h
curl https://deepay.srl/admin/cron  # if cron triggers the query() method
# or call directly via tinker
php index.php artisan tinker
>>> App\Http\Controllers\Gateway\Alipay\ProcessController::class
>>> (new App\Http\Controllers\Gateway\Alipay\ProcessController)->query()
```

---

## 3. General IPN debugging checklist

1. **Check logs first**: `tail -f core/storage/logs/laravel.log`
2. **Verify IPN URL is public**: `curl -X POST https://deepay.srl/ipn/GatewayAlias`
3. **Check PHP errors**: Nginx error log at `/www/wwwlogs/www.deepay.srl.error.log`
4. **Check open_basedir**: Run `sudo bash deploy/fix-server.sh`
5. **Check gateway credentials**: Each gateway has specific credential fields in Admin → Gateway
6. **Verify deposit status**: `Deposit::where('trx', 'TRX123')->first()->status`

---

## 4. Adding a new payment gateway

1. Create `app/Http/Controllers/Gateway/{GatewayName}/ProcessController.php`
2. Implement `static process($deposit)` and `ipn(Request $request)`
3. Add route in `routes/ipn.php` using `->name('ipn.{GatewayAlias}')`
4. Seed or insert gateway record in `gateways` table
5. Test with a real or sandbox transaction

---

*See also: [ROUTING.md](ROUTING.md) • [SECURITY.md](SECURITY.md)*
