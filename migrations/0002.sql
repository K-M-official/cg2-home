drop table if exists heat_records;

CREATE TABLE IF NOT EXISTS item_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    misc TEXT NOT NULL, -- json
    description TEXT NOT NULL,  -- html
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    misc TEXT NOT NULL, -- json
    description TEXT NOT NULL,  -- html
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS item_heat_record_windows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    delta INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    expired_at INTEGER NOT NULL
);

-- 插入 item_groups (tags)
INSERT INTO item_groups (title, misc, description, created_at) VALUES
('Scientist', '{"id":"scientist"}', '<p>Scientists are professionals who systematically explore natural laws, propose and test hypotheses, and continually expand the boundaries of human knowledge. Through rigorous experimental design, data collection and analysis, peer review, and cross-disciplinary collaboration, they ensure reliability and reproducibility. Their work not only advances academic research and technological invention but also shapes education, industry, and public policy across energy, healthcare, transportation, and information systems.</p>', datetime('now')),
('Politician', '{"id":"politician"}', '<p>Politicians are public leaders who formulate policies, build consensus, and represent constituencies within democratic or other governance systems. Effective politicians balance long-term national priorities with immediate civic needs, communicate clearly to the public, and work across parties and institutions to enact laws. Their decisions influence social welfare, economic development, national security, and international relations.</p>', datetime('now'));

-- 插入 items (persons)
INSERT INTO items (group_id, title, misc, description, created_at) VALUES
(1, 'Albert Einstein', '{"id":"Einstein","image":"https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_Head.jpg","birthDate":"1879-03-14","deathDate":"1955-04-18"}', '<p>Albert Einstein was a German-born theoretical physicist who developed the theory of relativity, one of the two pillars of modern physics.</p><p>His work also profoundly influenced the early development of quantum mechanics and modern philosophy of science.</p><p>Einstein redefined the concepts of space and time, inspired generations of scientists, and contributed to public understanding of science and humanitarian causes.</p>', datetime('now')),
(1, 'Isaac Newton', '{"id":"Newton","image":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Portrait_of_Sir_Isaac_Newton%2C_1689_%28brightened%29.jpg/500px-Portrait_of_Sir_Isaac_Newton%2C_1689_%28brightened%29.jpg","birthDate":"1643-01-04","deathDate":"1727-03-31"}', '<p>Isaac Newton was an English mathematician, physicist, astronomer, and author who is widely recognized as one of the greatest scientists in history.</p><p>Best known for the laws of motion and universal gravitation, he established the foundations of classical mechanics in Principia.</p><p>Newton also made seminal contributions to optics and calculus, shaping the scientific method and enabling the quantitative description of the physical world.</p>', datetime('now')),
(1, 'Qian Xuesen', '{"id":"Qian Xuesen","image":"https://upload.wikimedia.org/wikipedia/commons/f/fd/%E6%AD%B8%E5%9C%8B%E5%BE%8C%E7%9A%84%E9%8C%A2%E5%AD%B8%E6%A3%AE.png","birthDate":"1910-11-21","deathDate":"1998-12-19"}', '<p>Qian Xuesen was a Chinese scientist, engineer, and educator who played a foundational role in the development of China''s aerospace program.</p><p>He made pioneering contributions in missile, rocket, and systems engineering, bridging theory and large-scale engineering practice.</p><p>Qian also emphasized talent development and interdisciplinary systems thinking, which significantly shaped national science and industrial capabilities.</p>', datetime('now')),
(2, 'Abraham Lincoln', '{"id":"Lincoln","image":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Abraham_Lincoln_O-77_matte_collodion_print.jpg/500px-Abraham_Lincoln_O-77_matte_collodion_print.jpg","birthDate":"1809-02-12","deathDate":"1998-12-19"}', '<p>Abraham Lincoln was an American statesman best known for leading the United States during the Civil War and issuing the Emancipation Proclamation.</p><p>He is remembered for his moral courage, clear communication, and commitment to the preservation of the Union and the rule of law.</p><p>His leadership and speeches continue to shape American political identity and public governance.</p>', datetime('now')),
(2, 'Mao Zedong', '{"id":"Mao Zedong","image":"https://upload.wikimedia.org/wikipedia/commons/9/9b/Mao_Tse_Tung.jpg","birthDate":"1893-12-26","deathDate":"1976-09-09"}', '<p>Mao Zedong was a Chinese political leader known for his leadership of the Communist Party of China and his central role in shaping modern China''s state structure and mass mobilization strategies.</p><p>His political thought and practices have had a lasting and complex influence on domestic and international studies of politics and history.</p>', datetime('now')),
(2, 'Alexander the Great', '{"id":"Alexander","image":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/AlexanderTheGreat_Bust.jpg/500px-AlexanderTheGreat_Bust.jpg","birthDate":"356-07-20","deathDate":"323-06-10"}', '<p>Alexander the Great was a Macedonian king who ruled from 336 to 323 BC. He is known for his military conquests and his unification of the Greek world.</p><p>He is also known for his philosophical and cultural influence, particularly his adoption of the Macedonian culture and his promotion of Hellenism.</p>', datetime('now')),
(2, 'Napoleon Bonaparte', '{"id":"Napoleon","image":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg/500px-Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg","birthDate":"336-07-20","deathDate":"323-06-10"}', '<p>Napoleon Bonaparte was a French military leader who ruled as Emperor of the French from 1804 to 1814 and again briefly in 1815.</p><p>He is known for his military conquests and his unification of the French Empire.</p>', datetime('now')),
(2, 'George Washington', '{"id":"Washington","image":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Gilbert_Stuart_Williamstown_Portrait_of_George_Washington_%28cropped%29%282%29.jpg/500px-Gilbert_Stuart_Williamstown_Portrait_of_George_Washington_%28cropped%29%282%29.jpg","birthDate":"1732-02-22","deathDate":"1799-12-14"}', '<p>George Washington was the first president of the United States and is known for his leadership during the American Revolutionary War.</p>', datetime('now')),
(2, 'Mahatma Gandhi', '{"id":"Gandhi","image":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Mahatma-Gandhi%2C_studio%2C_1931.jpg/500px-Mahatma-Gandhi%2C_studio%2C_1931.jpg","birthDate":"1869-10-02","deathDate":"1948-01-30"}', '<p>Mahatma Gandhi was an Indian political and spiritual leader who was the driving force behind India''s independence from British rule.</p>', datetime('now')),
(2, 'Elizabeth I', '{"id":"Elizabeth","image":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Elizabeth_I_Darnley_Portrait_v2.jpg/500px-Elizabeth_I_Darnley_Portrait_v2.jpg","birthDate":"1533-09-07","deathDate":"1603-03-24"}', '<p>Elizabeth I was the queen of the United Kingdom and the other Commonwealth realms from 1558 to 1603.</p>', datetime('now'));
