-- Sacrament Meetings: schema + seed data
-- Paste this whole file into Vercel → Storage → (your database) → Query and run it.
-- Safe to re-run: the table is only created once and seed rows skip dates that already exist.

CREATE TABLE IF NOT EXISTS meetings (
  id             SERIAL        PRIMARY KEY,
  date           DATE          NOT NULL UNIQUE,
  meeting_type   VARCHAR(20)   NOT NULL
                               CHECK (meeting_type IN
                                 ('testimony','regular','stake','general','special')),
  presiding      VARCHAR(255)  NOT NULL,
  conducting     VARCHAR(255)  NOT NULL,
  announcements  TEXT[]        DEFAULT '{}',
  opening_hymn   JSONB         NOT NULL,
  opening_prayer VARCHAR(255)  NOT NULL,
  ward_business  JSONB         DEFAULT '[]',
  stake_business BOOLEAN       DEFAULT false,
  sacrament_hymn JSONB         NOT NULL,
  speakers       JSONB         DEFAULT '[]',
  closing_hymn   JSONB         NOT NULL,
  closing_prayer VARCHAR(255)  NOT NULL
);

INSERT INTO meetings (
  date, meeting_type, presiding, conducting, announcements,
  opening_hymn, opening_prayer, ward_business, stake_business,
  sacrament_hymn, speakers, closing_hymn, closing_prayer
) VALUES
(
  '2026-03-01', 'testimony', 'Bishop Smith', 'Brother Jones',
  ARRAY['Fast offering envelopes are in the foyer'],
  '{"number":19,"title":"We Thank Thee, O God, for a Prophet"}', 'Sister Park',
  '[]', false,
  '{"number":175,"title":"O God, the Eternal Father"}',
  '[]',
  '{"number":85,"title":"How Firm a Foundation"}', 'Brother Alvarez'
),
(
  '2026-05-03', 'regular', 'Bishop Smith', 'Brother Jones',
  ARRAY['Ward temple night: May 10', 'Youth activity Saturday at 10:00 AM'],
  '{"number":2,"title":"The Spirit of God"}', 'Sister Williams',
  '[{"description":"Sustaining of new Primary president"}]', false,
  '{"number":169,"title":"As Now We Take the Sacrament"}',
  '[{"name":"Sister Brown","topic":"Faith in Jesus Christ","type":"speaker"},
    {"name":"Youth Choir","topic":"","type":"musical-number"}]',
  '{"number":31,"title":"O God, Our Help in Ages Past"}', 'Brother Davis'
),
(
  '2026-05-10', 'regular', 'Bishop Smith', 'Brother Moore',
  ARRAY['Family history workshop on Friday'],
  '{"number":136,"title":"I Know That My Redeemer Lives"}', 'Brother Thompson',
  '[{"description":"Volunteer sign-ups for service project"},
    {"description":"Ward clean-up day schedule"}]', false,
  '{"number":193,"title":"I Stand All Amazed"}',
  '[{"name":"Brother Allen","topic":"Repentance and renewal","type":"speaker"},
    {"name":"Sister Patel","topic":"Service to others","type":"speaker"}]',
  '{"number":116,"title":"Come, Follow Me"}', 'Sister Kim'
),
(
  '2026-05-17', 'stake', 'President Hall', 'President Hall',
  ARRAY['Stake conference adult session Saturday at 7:00 PM'],
  '{"number":82,"title":"For All the Saints"}', 'Brother Young',
  '[]', true,
  '{"number":181,"title":"Jesus of Nazareth, Savior and King"}',
  '[{"name":"Brother Rivera","topic":"Charity and compassion","type":"speaker"},
    {"name":"Stake Choir","topic":"","type":"musical-number"}]',
  '{"number":30,"title":"Come, Come, Ye Saints"}', 'Sister Gomez'
),
(
  '2026-05-24', 'general', 'Bishop Adams', 'Brother Foster',
  ARRAY['Young women camp registration closes Friday'],
  '{"number":6,"title":"Redeemer of Israel"}', 'Brother Long',
  '[]', false,
  '{"number":172,"title":"In Humility, Our Savior"}',
  '[{"name":"Elder Martin","topic":"The blessings of the temple","type":"speaker"}]',
  '{"number":27,"title":"Praise to the Man"}', 'Sister Ramirez'
),
(
  '2026-05-31', 'regular', 'Bishop Smith', 'Brother Jenkins',
  ARRAY['Relief Society luncheon', 'Service project sign-up'],
  '{"number":140,"title":"Did You Think to Pray?"}', 'Sister Scott',
  '[{"description":"Release - Sister Martinez - Primary Teacher"},
    {"description":"Sustain - Sister Agbavor - Primary Teacher"}]', false,
  '{"number":177,"title":"Tis Sweet to Sing the Matchless Love"}',
  '[{"name":"Sister Brooks","topic":"Prayer and gratitude","type":"speaker"},
    {"name":"Sister Osei","topic":"","type":"musical-number"},
    {"name":"Brother Santos","topic":"Temple covenants","type":"speaker"}]',
  '{"number":166,"title":"Abide with Me!"}', 'Brother Williams'
),
(
  '2026-10-25', 'regular', 'Bishop Smith', 'Sister Torres',
  ARRAY['Ministering interviews this week'],
  '{"number":98,"title":"I Need Thee Every Hour"}', 'Brother Kim',
  '[{"description":"Sustain - Sister Mukiwa - Relief Society 2nd Counselor"}]', false,
  '{"number":173,"title":"While of These Emblems We Partake"}',
  '[{"name":"Sister Nakamura","topic":"Personal revelation","type":"speaker"},
    {"name":"Brother Chen","topic":"The Sabbath day","type":"speaker"}]',
  '{"number":226,"title":"Improve the Shining Moments"}', 'Sister Jensen'
),
(
  '2026-11-01', 'testimony', 'Bishop Smith', 'Brother Jones',
  ARRAY['Tithing declaration appointments are open', 'Ward Christmas party committee meets Tuesday'],
  '{"number":19,"title":"We Thank Thee, O God, for a Prophet"}', 'Sister Nelson',
  '[{"description":"Release of the Sunday School secretary"}]', false,
  '{"number":181,"title":"Jesus of Nazareth, Savior and King"}',
  '[]',
  '{"number":85,"title":"How Firm a Foundation"}', 'Brother Harris'
),
(
  '2026-11-08', 'regular', 'Bishop Smith', 'Brother Moore',
  ARRAY['Stake conference is in two weeks', 'Food drive donations due Saturday'],
  '{"number":98,"title":"I Need Thee Every Hour"}', 'Sister Evans',
  '[{"description":"Sustaining of new ward clerk"}]', false,
  '{"number":196,"title":"Jesus, Once of Humble Birth"}',
  '[{"name":"Sister Clark","topic":"Gratitude","type":"speaker"},
    {"name":"Ward Choir","topic":"","type":"musical-number"},
    {"name":"Brother Lewis","topic":"Ministering like the Savior","type":"speaker"}]',
  '{"number":166,"title":"Abide with Me!"}', 'Brother Turner'
),
(
  '2026-11-15', 'regular', 'Bishop Smith', 'Sister Torres',
  ARRAY['Thanksgiving service project on Saturday'],
  '{"number":92,"title":"For the Beauty of the Earth"}', 'Brother Okafor',
  '[]', false,
  '{"number":169,"title":"As Now We Take the Sacrament"}',
  '[{"name":"Brother Okoro","topic":"Gratitude in all things","type":"speaker"},
    {"name":"Sister Adeyemi","topic":"Counting our blessings","type":"speaker"}]',
  '{"number":94,"title":"Come, Ye Thankful People"}', 'Sister Mensah'
)
ON CONFLICT (date) DO NOTHING;
