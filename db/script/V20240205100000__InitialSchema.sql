-- lg_login_session definition
CREATE TABLE IF NOT EXISTS lg_login_session (
    login_session_id INTEGER PRIMARY KEY AUTOINCREMENT,
    error_msg TEXT NULL,
    is_success INTEGER NOT NULL,
    jwt_token TEXT NULL,
    login_datetime TEXT NOT NULL,
    logout_datetime TEXT NULL,
    user_id INTEGER NOT NULL,
    app TEXT DEFAULT 'BATGUI' NOT NULL
);

-- lk_menu definition
CREATE TABLE IF NOT EXISTS lk_menu (
    menu_id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_code TEXT NOT NULL,
    menu_name TEXT NOT NULL,
    page_name TEXT NULL,
    order_level INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    parent_menu_code TEXT NULL,
    has_page INTEGER NOT NULL,
    has_view INTEGER NOT NULL,
    has_add INTEGER NOT NULL,
    has_edit INTEGER NOT NULL,
    has_delete INTEGER NOT NULL,
    has_export INTEGER NOT NULL,
    status_code TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_datetime TEXT NOT NULL,
    edited_by TEXT NOT NULL,
    edited_datetime TEXT NOT NULL,
    version INTEGER DEFAULT 0 NOT NULL
);

-- mt_group definition
CREATE TABLE IF NOT EXISTS mt_group (
    group_id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_code TEXT NOT NULL,
    group_desc TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_datetime TEXT NOT NULL,
    edited_by TEXT NOT NULL,
    edited_datetime TEXT NOT NULL,
    status_code TEXT NOT NULL,
    version INTEGER DEFAULT 0 NOT NULL
);

-- mt_group_menu_access definition
CREATE TABLE IF NOT EXISTS mt_group_menu_access (
    group_menu_access_id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NULL,
    menu_id INTEGER NOT NULL,
    is_page_granted INTEGER NOT NULL,
    is_view_granted INTEGER NOT NULL,
    is_add_granted INTEGER NOT NULL,
    is_edit_granted INTEGER NOT NULL,
    is_delete_granted INTEGER NOT NULL,
    is_export_granted INTEGER NOT NULL,
    status_code TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_datetime TEXT NOT NULL,
    edited_by TEXT NOT NULL,
    edited_datetime TEXT NOT NULL,
    version INTEGER DEFAULT 0 NOT NULL
);

-- mt_user definition
CREATE TABLE IF NOT EXISTS mt_user (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    last_login_datetime TEXT NULL,
    status_code TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    created_by TEXT NULL,
    created_datetime TEXT NULL,
    edited_by TEXT NULL,
    edited_datetime TEXT NULL,
    version INTEGER DEFAULT 0 NOT NULL
);

-- mt_user_group definition
CREATE TABLE IF NOT EXISTS mt_user_group (
    user_group_id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_by TEXT NULL,
    created_datetime TEXT NULL,
    edited_by TEXT NULL,
    edited_datetime TEXT NULL,
    status_code TEXT NOT NULL,
    group_id INTEGER NULL,
    user_id INTEGER NULL,
    version INTEGER DEFAULT 0 NOT NULL
);

-- mt_customer definition
CREATE TABLE IF NOT EXISTS mt_customer (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    address TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    telephone TEXT NOT NULL,
    fax TEXT NOT NULL,
    status_code TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_datetime TEXT NOT NULL,
    edited_by TEXT NOT NULL,
    edited_datetime TEXT NOT NULL,
    status_code TEXT NOT NULL,
    version INTEGER DEFAULT 0 NOT NULL
);

