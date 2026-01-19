-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (), collaboration_id UUID NOT NULL REFERENCES collaborations (id) ON DELETE CASCADE, sender_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE, content TEXT NOT NULL, timestamp TIMESTAMPTZ DEFAULT NOW(), read BOOLEAN DEFAULT FALSE
);

-- Index for faster message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_collaboration_id ON messages (collaboration_id);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies (adjust as needed for production)
CREATE POLICY "Users can see messages in their collaborations" ON messages FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM collaborations c
                JOIN users u ON u.profile_id IN (c.company_id, c.partner_id)
            WHERE
                c.id = messages.collaboration_id
                AND u.id = auth.uid ()
        )
    );

CREATE POLICY "Users can insert messages in their collaborations" ON messages FOR
INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM collaborations c
                JOIN users u ON u.profile_id IN (c.company_id, c.partner_id)
            WHERE
                c.id = messages.collaboration_id
                AND u.id = auth.uid ()
        )
    );