USE [YOUR_PROJECT_NAME]
GO
/****** Object:  Schema [UDT]    Script Date: 19/05/2025 8:20:14 pm ******/
CREATE SCHEMA [UDT]
GO
/****** Object:  UserDefinedTableType [UDT].[UserPermission]    Script Date: 19/05/2025 8:20:14 pm ******/
CREATE TYPE [UDT].[UserPermission] AS TABLE(
	[ID] [bigint] NULL,
	[USER_ID] [bigint] NULL,
	[MODULE_ID] [int] NULL,
	[CREATE] [bit] NULL,
	[READ] [bit] NULL,
	[UPDATE] [bit] NULL,
	[DELETE] [bit] NULL
)
GO
/****** Object:  Table [dbo].[APILogs]    Script Date: 19/05/2025 8:20:14 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[APILogs](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [varchar](80) NULL,
	[Timestamp] [datetime] NOT NULL,
	[EventType] [varchar](50) NOT NULL,
	[Message] [nvarchar](max) NOT NULL,
	[RequestPath] [nvarchar](2048) NULL,
	[RequestMethod] [varchar](10) NULL,
	[Body] [nvarchar](max) NULL,
	[ResponseStatusCode] [int] NULL,
	[Duration] [bigint] NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ModuleItems]    Script Date: 19/05/2025 8:20:14 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ModuleItems](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[NAME] [varchar](120) NOT NULL,
	[PARENT_NAME] [varchar](120) NULL,
	[PARENT_ID] [int] NULL,
	[CREATED_AT] [datetime] NULL,
	[UPDATED_AT] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[NAME] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RoleType]    Script Date: 19/05/2025 8:20:14 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RoleType](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[NAME] [varchar](80) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[NAME] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserPermissions]    Script Date: 19/05/2025 8:20:14 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserPermissions](
	[ID] [bigint] IDENTITY(1,1) NOT NULL,
	[USER_ID] [bigint] NOT NULL,
	[MODULE_ID] [int] NOT NULL,
	[CREATE] [bit] NOT NULL,
	[READ] [bit] NOT NULL,
	[UPDATE] [bit] NOT NULL,
	[DELETE] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[USERS]    Script Date: 19/05/2025 8:20:14 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[USERS](
	[ID] [bigint] IDENTITY(1,1) NOT NULL,
	[USERNAME] [varchar](255) NOT NULL,
	[PASSWORD] [varchar](max) NOT NULL,
	[CREATED_AT] [date] NULL,
	[ROLE] [varchar](80) NOT NULL,
	[IS_ACTIVE] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[USERNAME] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserSessions]    Script Date: 19/05/2025 8:20:14 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserSessions](
	[ID] [bigint] IDENTITY(1,1) NOT NULL,
	[USER_ID] [bigint] NULL,
	[SESSION_DATE] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[ModuleItems] ADD  DEFAULT (getdate()) FOR [CREATED_AT]
GO
ALTER TABLE [dbo].[UserPermissions] ADD  DEFAULT ((0)) FOR [CREATE]
GO
ALTER TABLE [dbo].[UserPermissions] ADD  DEFAULT ((0)) FOR [READ]
GO
ALTER TABLE [dbo].[UserPermissions] ADD  DEFAULT ((0)) FOR [UPDATE]
GO
ALTER TABLE [dbo].[UserPermissions] ADD  DEFAULT ((0)) FOR [DELETE]
GO
ALTER TABLE [dbo].[USERS] ADD  DEFAULT (getdate()) FOR [CREATED_AT]
GO
ALTER TABLE [dbo].[USERS] ADD  DEFAULT ('User') FOR [ROLE]
GO
ALTER TABLE [dbo].[USERS] ADD  DEFAULT ((1)) FOR [IS_ACTIVE]
GO
ALTER TABLE [dbo].[UserSessions] ADD  DEFAULT (getdate()) FOR [SESSION_DATE]
GO
ALTER TABLE [dbo].[UserPermissions]  WITH CHECK ADD FOREIGN KEY([MODULE_ID])
REFERENCES [dbo].[ModuleItems] ([ID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserPermissions]  WITH CHECK ADD FOREIGN KEY([USER_ID])
REFERENCES [dbo].[USERS] ([ID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserSessions]  WITH CHECK ADD FOREIGN KEY([USER_ID])
REFERENCES [dbo].[USERS] ([ID])
ON DELETE CASCADE
GO
/****** Object:  StoredProcedure [dbo].[NSP_UserPermission]    Script Date: 19/05/2025 8:20:14 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[NSP_UserPermission] 
	@FLAG				VARCHAR(120) = ''
,	@USER_ID			VARCHAR(120) = ''
,	@USER_PERMISSION	[UDT].[UserPermission] READONLY

AS
BEGIN
	IF @FLAG = 'GET PERMISSION'
	BEGIN
		SELECT 
					upr.ID
				,	mdl.[ID] [MODULE_ID]
				,	mdl.[NAME]
				,	upr.[USER_ID]
				,	COALESCE(upr.[CREATE], 0) [CREATE]
				,	COALESCE(upr.[READ], 0)	[READ]
				,	COALESCE(upr.[UPDATE], 0) [UPDATE]
				,	COALESCE(upr.[DELETE], 0) [DELETE]
		FROM		ModuleItems mdl
		LEFT JOIN	dbo.UserPermissions upr
		ON			mdl.[ID] = upr.[MODULE_ID]
		AND			upr.[USER_ID] = @USER_ID
	END

	IF @FLAG = 'SAVE PERMISSIONS'
	BEGIN
		MERGE	.UserPermissions	target
		USING	@USER_PERMISSION	source
		ON		target.[ID] = source.[ID]
		WHEN MATCHED THEN
			UPDATE 
				SET
					target.[CREATE] = source.[CREATE]
				,	target.[READ]	= source.[READ]
				,	target.[UPDATE] = source.[UPDATE]
				,	target.[DELETE] = source.[DELETE]
		WHEN NOT MATCHED THEN
			INSERT (
					[USER_ID]
				,	[MODULE_ID]
				,	[CREATE]
				,	[READ]
				,	[UPDATE]
				,	[DELETE]
			)
			VALUES (
					source.[USER_ID]
				,	source.[MODULE_ID]
				,	source.[CREATE]
				,	source.[READ]
				,	source.[UPDATE]
				,	source.[DELETE]
			);
		
	END
	
END
GO
/****** Object:  Trigger [dbo].[UpdateRowIfLogPath]    Script Date: 19/05/2025 8:20:14 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		JPDC
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE TRIGGER [dbo].[UpdateRowIfLogPath]
   ON  [dbo].[APILogs]
   AFTER INSERT
AS 
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    UPDATE dbo.[APILogs]
    SET Body = NULL -- avoid recording the login credentials of users
    WHERE ID IN (SELECT ID FROM inserted)
	AND RequestPath = '/api/auth/login' 
	OR RequestPath = '/api/auth/register' 
	AND EventType = 'RequestStart'

END
GO
ALTER TABLE [dbo].[APILogs] ENABLE TRIGGER [UpdateRowIfLogPath]
GO
