# DeePay — Extensions System

---

## 1. Overview

The Extensions system lets you add optional features to DeePay without modifying core files. Each extension is a self-contained module that can be enabled/disabled from the admin panel (**Admin → Extensions**).

---

## 2. Directory structure

```
extensions/
└── {ExtensionName}/
    ├── extension.json          ← manifest (name, version, author, description)
    ├── config.php              ← default configuration values
    ├── routes/
    │   └── web.php             ← (optional) additional web routes
    ├── database/
    │   └── migrations/         ← (optional) migration files
    ├── views/
    │   └── ...                 ← Blade templates (optional)
    └── src/
        └── ...                 ← PHP classes (auto-discovered via PSR-4)
```

---

## 3. `extension.json` manifest

```json
{
    "name": "MyExtension",
    "alias": "my_extension",
    "version": "1.0.0",
    "author": "Your Name",
    "description": "What this extension does.",
    "min_core_version": "1.6"
}
```

---

## 4. Install a new extension

```bash
# 1. Place the extension folder under extensions/
cp -r /path/to/MyExtension extensions/

# 2. Run any migrations it includes
php index.php artisan migrate --path=extensions/MyExtension/database/migrations --force

# 3. Publish its config (if provided)
# Manual: copy extensions/MyExtension/config.php to core/config/ if needed

# 4. Enable from admin panel:
#    Admin → Extensions → MyExtension → Enable
```

---

## 5. Enable / disable

- **Enable**: Admin → Extensions → click the toggle or "Activate" button
- **Disable**: same toggle — extension code is no longer loaded but data is preserved
- State is stored in the `extensions` database table

---

## 6. Constraints

| Rule | Reason |
|---|---|
| Do not modify files outside `extensions/{YourExtension}/` | Core updates will overwrite changes |
| Migrations must be namespaced to avoid conflicts | Use a unique prefix, e.g. `ext_myextension_` for table names |
| Views must be namespaced | Register under a unique view namespace in your service provider |
| Do not hardcode absolute paths | Use `base_path()`, `config_path()`, `storage_path()` helpers |
| Keep extension migrations reversible | Implement `down()` properly so the extension can be uninstalled cleanly |

---

## 7. Skeleton template

Copy this skeleton to start a new extension:

```bash
cp -r extensions/_skeleton extensions/MyNewExtension
# Then edit extension.json to fill in name/alias/description
```

### Skeleton file listing

```
extensions/_skeleton/
├── extension.json
├── config.php
├── database/
│   └── migrations/
│       └── .gitkeep
├── routes/
│   └── web.php
├── views/
│   └── .gitkeep
└── src/
    └── ServiceProvider.php
```

### `src/ServiceProvider.php` (minimal)

```php
<?php

namespace Extensions\MyExtension;

use Illuminate\Support\ServiceProvider as BaseServiceProvider;

class ServiceProvider extends BaseServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../config.php', 'my_extension');
    }

    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__ . '/../views', 'my_extension');
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
    }
}
```

---

## 8. Upgrade & migration strategy

1. Replace the extension folder contents (do not delete the folder).
2. Run `php index.php artisan migrate --path=extensions/MyExtension/database/migrations --force`
3. Clear caches: `php index.php artisan optimize:clear`
4. Test.

---

*See also: [ROUTING.md](ROUTING.md) • [AUTH.md](AUTH.md)*
