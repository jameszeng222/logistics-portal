-- 种子数据：物流部内部网站基础数据

-- 品牌团队
INSERT INTO brands (name) VALUES ('LM');
INSERT INTO brands (name) VALUES ('LM-TT');
INSERT INTO brands (name) VALUES ('FD');
INSERT INTO brands (name) VALUES ('FD-TT');

-- 渠道
INSERT INTO channels (name, dim_divisor) VALUES ('UPS', 5000);
INSERT INTO channels (name, dim_divisor) VALUES ('空运', 6000);
INSERT INTO channels (name, dim_divisor) VALUES ('海运', 1000);

-- 分泡规则
INSERT INTO dim_rules (channel_name, dim_divisor, is_default) VALUES ('UPS', 5000, 1);
INSERT INTO dim_rules (channel_name, dim_divisor, is_default) VALUES ('空运', 6000, 1);
INSERT INTO dim_rules (channel_name, dim_divisor, is_default) VALUES ('海运', 1000, 1);

-- 示例服务商
INSERT INTO providers (name, channel_id, contact_person, contact_phone, email, status, cooperation_start_date, notes)
VALUES ('华贸物流', 3, '张经理', '13800001111', 'huamao@example.com', 'active', '2024-01-01', '海运散货主力渠道');

INSERT INTO providers (name, channel_id, contact_person, contact_phone, email, status, cooperation_start_date, notes)
VALUES ('东莞环亚', 3, '李经理', '13800002222', 'huanya@example.com', 'active', '2024-03-01', '海运散货备用渠道');

INSERT INTO providers (name, channel_id, contact_person, contact_phone, email, status, cooperation_start_date, notes)
VALUES ('南航货运', 2, '王经理', '13800003333', 'csair@example.com', 'active', '2024-01-01', '空运主力渠道');

INSERT INTO providers (name, channel_id, contact_person, contact_phone, email, status, cooperation_start_date, notes)
VALUES ('美通国际', 3, '赵经理', '13800004444', 'meitong@example.com', 'active', '2024-06-01', '海运散货渠道');

INSERT INTO providers (name, channel_id, contact_person, contact_phone, email, status, cooperation_start_date, notes)
VALUES ('UPS代理-万邑通', 1, '陈经理', '13800005555', 'wantong@example.com', 'active', '2024-01-01', 'UPS代理渠道');

INSERT INTO providers (name, channel_id, contact_person, contact_phone, email, status, cooperation_start_date, notes)
VALUES ('云途物流', 2, '刘经理', '13800006666', 'yuntu@example.com', 'active', '2025-01-01', '假发专线测试中');

-- 成员周报模板
INSERT INTO member_report_templates (member_name, template) VALUES ('颖珊', '[{"type":"table","title":"海外仓发货数据","columns":["","LM","LM-TT","FD-TT","FD","总计"]},{"type":"table","title":"海外仓均价数据","columns":["","LM","FD","备注"]},{"type":"list","title":"直邮"},{"type":"list","title":"万邑通"},{"type":"list","title":"逆向"},{"type":"list","title":"其他"},{"type":"list","title":"下周计划"}]');

INSERT INTO member_report_templates (member_name, template) VALUES ('子曦', '[{"type":"table","title":"头程调拨价格时效","columns":["头程调拨","头程成本","上周成本对比","时效（提货-上架）","渠道占比","原因"]},{"type":"list","title":"工作事项"},{"type":"list","title":"下周计划"}]');

INSERT INTO member_report_templates (member_name, template) VALUES ('秋艳', '[{"type":"list","title":"对账以及请款情况"},{"type":"list","title":"主要事项情况"},{"type":"list","title":"下周计划"}]');

INSERT INTO member_report_templates (member_name, template) VALUES ('瓶子', '[{"type":"list","title":"UPS头程表日常登记和EDS发送"},{"type":"list","title":"大货发送统计"},{"type":"list","title":"日常工作事项"},{"type":"list","title":"异常处理"},{"type":"list","title":"下周计划"}]');
