﻿CREATE TABLE USERS (
	ID BIGINT IDENTITY(1,1) PRIMARY KEY
,	[USERNAME] VARCHAR(255) UNIQUE NOT NULL
,	[PASSWORD] VARCHAR(MAX) NOT NULL
,	[CREATED_AT] DATE DEFAULT GETDATE()
,	[ROLE] VARCHAR(80) NOT NULL DEFAULT 'User'
)