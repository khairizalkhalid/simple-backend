INSERT INTO lk_menu (menu_code,menu_name,page_name,order_level,order_index,parent_menu_code,has_page,has_view,has_add,has_edit,has_delete,has_export,status_code,created_by,created_datetime,edited_by,edited_datetime,version)
	VALUES 
	    ('USER', 'User Maintenance', 'User Maintenance', 1, 1, NULL, 1,1,1,1,1,1, 'A', 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM', CURRENT_TIMESTAMP, 0),
        ('GROUP', 'Group Maintenance', 'Group Maintenance', 1, 2, NULL, 1,1,1,1,1,1, 'A', 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM', CURRENT_TIMESTAMP, 0),
        ('CUSTOMER', 'Customer Maintenance', 'Customer Maintenance', 1, 3, NULL, 1,1,1,1,1,1, 'A', 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM', CURRENT_TIMESTAMP, 0),
        ('DASHBOARD', 'Dashboard', 'Dashboard', 1, 5, NULL, 1,1,1,1,1,1, 'A', 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM', CURRENT_TIMESTAMP, 0);

-- mt_group
INSERT INTO mt_group (created_by,created_datetime,edited_by,edited_datetime,group_code,group_desc,status_code,version)
	VALUES
	 ('SYSTEM',CURRENT_TIMESTAMP,'SYSTEM',CURRENT_TIMESTAMP,'ADMIN','Super Admin','A',0);

-- mt_group_access
INSERT INTO mt_group_menu_access (group_id,menu_id,is_page_granted,is_view_granted,is_add_granted,is_edit_granted,is_delete_granted,is_export_granted,status_code,created_by,created_datetime,edited_by,edited_datetime,version)
	VALUES 
        ((SELECT group_id FROM mt_group WHERE group_code = 'ADMIN'),(SELECT menu_id FROM lk_menu WHERE menu_code = 'USER'),1,1,1,1,1,1,'A','SYSTEM',CURRENT_TIMESTAMP,'SYSTEM',CURRENT_TIMESTAMP,0),
        ((SELECT group_id FROM mt_group WHERE group_code = 'ADMIN'),(SELECT menu_id FROM lk_menu WHERE menu_code = 'GROUP'),1,1,1,1,1,1,'A','SYSTEM',CURRENT_TIMESTAMP,'SYSTEM',CURRENT_TIMESTAMP,0),
        ((SELECT group_id FROM mt_group WHERE group_code = 'ADMIN'),(SELECT menu_id FROM lk_menu WHERE menu_code = 'CUSTOMER'),1,1,1,1,1,1,'A','SYSTEM',CURRENT_TIMESTAMP,'SYSTEM',CURRENT_TIMESTAMP,0),
        ((SELECT group_id FROM mt_group WHERE group_code = 'ADMIN'),(SELECT menu_id FROM lk_menu WHERE menu_code = 'DASHBOARD'),1,1,1,1,1,1,'A','SYSTEM',CURRENT_TIMESTAMP,'SYSTEM',CURRENT_TIMESTAMP,0);


-- mt_user
INSERT INTO mt_user (created_by,created_datetime,edited_by,edited_datetime,contact,first_name,last_login_datetime,last_name,status_code,username,password,version)
	VALUES
	 ('SYSTEM',CURRENT_TIMESTAMP,'SYSTEM',CURRENT_TIMESTAMP,'admin@kkteknik.com','Admin',CURRENT_TIMESTAMP,'System','A','admin','$2y$10$KLJNvkntVaS16TVuTJfP0OEIlok06CXEdqM4WbiiIHRjAoIyzRDvS',0); --password is admin123
	
-- mt_user_group
INSERT INTO mt_user_group (created_by,created_datetime,edited_by,edited_datetime,status_code,group_id,user_id,version)
	VALUES
	 ('SYSTEM',CURRENT_TIMESTAMP,'SYSTEM',CURRENT_TIMESTAMP,'A',(SELECT group_id FROM mt_group WHERE group_code='ADMIN'),(SELECT user_id FROM mt_user WHERE username='admin'),0);
