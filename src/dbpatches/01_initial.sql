CREATE TABLE module (
    key TEXT NOT NULL,
    data TEXT NOT NULL DEFAULT '{}',

    UNIQUE (key)
);