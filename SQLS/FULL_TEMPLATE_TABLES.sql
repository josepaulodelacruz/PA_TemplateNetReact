USE [master]
GO
/****** Object:  Database [YOUR_PROJECT_NAME]    Script Date: 12/06/2025 10:04:55 am ******/
CREATE DATABASE [YOUR_PROJECT_NAME]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'YOUR_PROJECT_NAME', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\YOUR_PROJECT_NAME.mdf' , SIZE = 2826240KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'YOUR_PROJECT_NAME_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\YOUR_PROJECT_NAME_log.ldf' , SIZE = 663552KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [YOUR_PROJECT_NAME].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET ARITHABORT OFF 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET AUTO_CLOSE ON 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET  ENABLE_BROKER 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET  MULTI_USER 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET DB_CHAINING OFF 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET QUERY_STORE = ON
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [YOUR_PROJECT_NAME]
GO
/****** Object:  Schema [UDT]    Script Date: 12/06/2025 10:04:55 am ******/
CREATE SCHEMA [UDT]
GO
/****** Object:  UserDefinedTableType [UDT].[CrashReportIMG]    Script Date: 12/06/2025 10:04:55 am ******/
CREATE TYPE [UDT].[CrashReportIMG] AS TABLE(
	[IMG] [nvarchar](max) NULL
)
GO
/****** Object:  UserDefinedTableType [UDT].[UserPermission]    Script Date: 12/06/2025 10:04:55 am ******/
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
/****** Object:  Table [dbo].[APILogs]    Script Date: 12/06/2025 10:04:55 am ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[APILogs](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [varchar](80) NULL,
	[Timestamp] [datetime] NOT NULL,
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
/****** Object:  Table [dbo].[CrashReportHDR]    Script Date: 12/06/2025 10:04:55 am ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CrashReportHDR](
	[ID] [bigint] IDENTITY(1,1) NOT NULL,
	[WHEN] [datetime] NOT NULL,
	[WHERE] [nvarchar](max) NOT NULL,
	[WHAT] [nvarchar](max) NOT NULL,
	[SEVERITY_LEVEL] [varchar](155) NOT NULL,
	[CREATED_BY] [bigint] NOT NULL,
	[CREATED_DATE] [datetime] NULL,
	[LOG_ID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CrashReportIMG]    Script Date: 12/06/2025 10:04:55 am ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CrashReportIMG](
	[ID] [bigint] IDENTITY(1,1) NOT NULL,
	[HDR_ID] [bigint] NULL,
	[LIN_ID] [bigint] NULL,
	[IMG] [nvarchar](max) NULL,
	[UPLOADED_DATE] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CrashReportLIN]    Script Date: 12/06/2025 10:04:55 am ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CrashReportLIN](
	[ID] [bigint] IDENTITY(1,1) NOT NULL,
	[HDR_ID] [bigint] NULL,
	[STACK_TRACE] [nvarchar](max) NULL,
	[BROWSER] [varchar](155) NULL,
	[OS] [varchar](80) NULL,
	[USER_AGENT] [nvarchar](max) NULL,
	[EMAIL] [varchar](155) NULL,
	[SCENARIO] [nvarchar](max) NULL,
	[DETAILS] [nvarchar](max) NULL,
	[CREATED_DATE] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ModuleItems]    Script Date: 12/06/2025 10:04:55 am ******/
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
/****** Object:  Table [dbo].[RoleType]    Script Date: 12/06/2025 10:04:55 am ******/
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
/****** Object:  Table [dbo].[UserPermissions]    Script Date: 12/06/2025 10:04:55 am ******/
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
/****** Object:  Table [dbo].[USERS]    Script Date: 12/06/2025 10:04:55 am ******/
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
/****** Object:  Table [dbo].[UserSessions]    Script Date: 12/06/2025 10:04:55 am ******/
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
ALTER TABLE [dbo].[CrashReportHDR] ADD  DEFAULT ('Medium') FOR [SEVERITY_LEVEL]
GO
ALTER TABLE [dbo].[CrashReportHDR] ADD  DEFAULT (getdate()) FOR [CREATED_DATE]
GO
ALTER TABLE [dbo].[CrashReportIMG] ADD  DEFAULT (getdate()) FOR [UPLOADED_DATE]
GO
ALTER TABLE [dbo].[CrashReportLIN] ADD  DEFAULT (getdate()) FOR [CREATED_DATE]
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
ALTER TABLE [dbo].[CrashReportHDR]  WITH CHECK ADD  CONSTRAINT [FK_CrashReport_APILogs] FOREIGN KEY([LOG_ID])
REFERENCES [dbo].[APILogs] ([Id])
GO
ALTER TABLE [dbo].[CrashReportHDR] CHECK CONSTRAINT [FK_CrashReport_APILogs]
GO
ALTER TABLE [dbo].[CrashReportHDR]  WITH CHECK ADD  CONSTRAINT [FK_CrashReportHDR_Users] FOREIGN KEY([CREATED_BY])
REFERENCES [dbo].[USERS] ([ID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[CrashReportHDR] CHECK CONSTRAINT [FK_CrashReportHDR_Users]
GO
ALTER TABLE [dbo].[CrashReportIMG]  WITH CHECK ADD  CONSTRAINT [FK_CrashReportIMG_CrashReportHDR] FOREIGN KEY([HDR_ID])
REFERENCES [dbo].[CrashReportHDR] ([ID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[CrashReportIMG] CHECK CONSTRAINT [FK_CrashReportIMG_CrashReportHDR]
GO
ALTER TABLE [dbo].[CrashReportIMG]  WITH CHECK ADD  CONSTRAINT [Fk_CrashReportIMG_CrashReportLIN] FOREIGN KEY([LIN_ID])
REFERENCES [dbo].[CrashReportLIN] ([ID])
GO
ALTER TABLE [dbo].[CrashReportIMG] CHECK CONSTRAINT [Fk_CrashReportIMG_CrashReportLIN]
GO
ALTER TABLE [dbo].[CrashReportLIN]  WITH CHECK ADD  CONSTRAINT [FK_CrashReportLIN_CrashReportHDR] FOREIGN KEY([HDR_ID])
REFERENCES [dbo].[CrashReportHDR] ([ID])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[CrashReportLIN] CHECK CONSTRAINT [FK_CrashReportLIN_CrashReportHDR]
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
/****** Object:  StoredProcedure [dbo].[NSP_APILogs]    Script Date: 12/06/2025 10:04:55 am ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[NSP_APILogs] 
	@FLAG	VARCHAR(120)	= ''
,	@PageNumber INT			= 1
,	@PageSize INT			= 10
,	@UserId	INT				= null

AS
BEGIN
	DECLARE	@Offset INT = (@PageNumber - 1) * @PageSize;

	-- EXEC [dbo].[NSP_APILogs] 'GET USER LOGS BY ID', 1, 10, 1
	
	IF @FLAG = 'GET USER LOGS BY ID'
	BEGIN
		-- Main pagination query with metadata
			WITH PaginatedResults AS (
				SELECT 
					Id,
					UserId,
					Timestamp,
					Message,
					RequestPath,
					RequestMethod,
					ResponseStatusCode,
					Body,
					Duration,
					ROW_NUMBER() OVER (ORDER BY Timestamp DESC) AS RowNum,
					COUNT(*) OVER() AS TotalCount
				FROM APILogs
				WHERE UserId = @UserId
			)
		SELECT 
			Id,
			UserId,
			Timestamp,
			Message,
			RequestPath,
			RequestMethod,
			ResponseStatusCode,
			Body,
			Duration,
			TotalCount,
			-- Pagination metadata
			@PageNumber AS CurrentPage,
			@PageSize AS PageSize,
			CEILING(CAST(TotalCount AS FLOAT) / @PageSize) AS TotalPages,
			CASE 
				WHEN @PageNumber < CEILING(CAST(TotalCount AS FLOAT) / @PageSize) THEN 1 
				ELSE 0 
			END AS HasNextPage,
			CASE 
				WHEN @PageNumber > 1 THEN 1 
				ELSE 0 
			END AS HasPreviousPage
		FROM PaginatedResults
		WHERE RowNum BETWEEN @Offset + 1 AND @Offset + @PageSize
		ORDER BY Timestamp DESC;
	END	


END
GO
/****** Object:  StoredProcedure [dbo].[NSP_CrashReport]    Script Date: 12/06/2025 10:04:55 am ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[NSP_CrashReport] 
	@FLAG		VARCHAR(MAX) = ''
	/*HDR PARAMS*/
,	@LOG_ID		INT			 = NULL
,	@WHEN		VARCHAR(MAX) = ''
,	@WHERE		VARCHAR(MAX) = ''
,	@WHAT		VARCHAR(MAX) = ''
,	@SEVERITY	VARCHAR(80)  = ''

	/*LIN PARAMS*/
,	@STACK_TRACE	NVARCHAR(MAX) = ''
,	@BROWSER		VARCHAR(80) = ''
,	@OS				VARCHAR(80) = ''
,	@USER_AGENT		VARCHAR(80) = ''
,	@EMAIL			VARCHAR(120) = ''
,	@SCENARIO		NVARCHAR(MAX) = ''
,	@DETAILS		VARCHAR(MAX) = ''

	/*IMG PARAMS*/
,	@IMG_TABLE		[UDT].[CrashReportIMG] READONLY

	/*OTHER PARAMS*/
,	@REPORT_ID		INT			= NULL
,	@CREATED_BY		VARCHAR(MAX) = ''
,	@PageNumber		INT			 = 1
,	@PageSize		INT			 = 10

AS
BEGIN
	
	IF @FLAG = 'CREATE CRASH REPORT'
	BEGIN
		
		DECLARE @xTempHDR AS TABLE (
			[LOG_ID] INT 
		,	[WHEN] VARCHAR(155)
		,	[WHERE] VARCHAR(MAX) 
		,	[WHAT] NVARCHAR(MAX)
		,	[SEVERITY_LEVEL] VARCHAR(80) 
		,	[CREATED_BY] BIGINT 
		)

		INSERT INTO @xTempHDR
		SELECT	@LOG_ID	
			,	@WHEN
			,	@WHERE
			,	@WHAT
			,	@SEVERITY
			,	@CREATED_BY
			

		-- =================================
		-- CREATE NEW REPORT HDR
		-- =================================
		INSERT INTO [dbo].[CrashReportHDR] (
				[LOG_ID]
			,	[WHEN]
			,	[WHERE]
			,	[WHAT]
			,	[SEVERITY_LEVEL]
			,	[CREATED_BY]
		) 
		SELECT * FROM @xTempHDR

		DECLARE @NEW_ID INT = SCOPE_IDENTITY();

		-- =================================
		-- CREATE NEW REPORT LIN
		-- =================================
		INSERT INTO [dbo].[CrashReportLIN] (
				[HDR_ID]
			,	[STACK_TRACE]
			,	[BROWSER]
			,	[OS]
			,	[USER_AGENT]
			,	[EMAIL]
			,	[SCENARIO]
			,	[DETAILS]
		) VALUES (
				@NEW_ID
			,	@STACK_TRACE
			,	@BROWSER
			,	@OS
			,	@USER_AGENT
			,	@EMAIL
			,	@SCENARIO
			,	@DETAILS
		)

		DECLARE @NEW_LIN_ID INT = SCOPE_IDENTITY()

		-- ====================================================
		-- INSERT IMG TO DATABASE
		-- ====================================================
		INSERT INTO dbo.[CrashReportIMG] ([HDR_ID], [LIN_ID], [IMG], [UPLOADED_DATE])
		SELECT 
			@NEW_ID
		,	@NEW_LIN_ID
		,	[IMG]
		,	GETDATE()
		FROM @IMG_TABLE 
		
	
	END

	IF @FLAG = 'GET REPORTS'
	BEGIN
		DECLARE	@Offset INT = (@PageNumber - 1) * @PageSize;

		WITH PaginatedResults AS (
			SELECT
					hdr.[WHEN]
				,	hdr.[WHERE]
				,	hdr.[WHAT]
				,	hdr.[SEVERITY_LEVEL]
				,	usr.[USERNAME] [CREATED_BY]
				,	hdr.[LOG_ID]
				,	lin.*
				,	x.IMG
				,	ROW_NUMBER() OVER (ORDER BY hdr.[CREATED_DATE] DESC) AS RowNum
				,	COUNT(*) OVER() as TotalCount
			FROM [dbo].[CrashReportHDR] hdr
			JOIN [dbo].[CrashReportLIN] lin
			ON hdr.[ID] = lin.[HDR_ID]
			LEFT JOIN [dbo].[USERS] usr
			ON hdr.[CREATED_BY] = usr.[ID]
			OUTER APPLY (
				SELECT 
					top 1 *
				FROM CrashReportIMG WHERE HDR_ID = hdr.[ID]
			) x
		)

		SELECT 
				*
			,	@PageNumber as CurrentPage
			,	@PageSize AS PageSize
			,	CEILING(CAST(TotalCount AS FLOAT) / @PageSize) AS TotalPages
			,	CASE 
					WHEN @PageNumber < CEILING(CAST(TotalCount AS FLOAT) / @PageSize) THEN 1 
					ELSE 0 
				END AS HasNextPage,
				CASE 
					WHEN @PageNumber > 1 THEN 1 
					ELSE 0 
				END AS HasPreviousPage

		FROM	PaginatedResults
		WHERE	RowNum BETWEEN @Offset + 1 AND @Offset + @PageSize
		ORDER	BY CREATED_DATE DESC;
	END

	IF @FLAG = 'GET REPORT BY ID'
	BEGIN
		SELECT 
					hdr.*
				,	lin.*
				,	img.[IMG]
		FROM		dbo.[CrashReportHDR] hdr
		JOIN		dbo.[CrashReportLIN] lin
		ON			hdr.ID = lin.[HDR_ID]
		LEFT JOIN	dbo.[CrashReportIMG] img
		ON			hdr.ID = img.[HDR_ID]
		AND			lin.ID = img.[LIN_ID]
		WHERE		hdr.[ID] = @REPORT_ID
	END

END

/*
	EXEC [dbo].[NSP_CrashReport]
	@FLAG	= 'GET REPORTS',
	@PageNumber = 1,
	@PageSize = 10

	EXEC [dbo].[NSP_CrashReport]
	@FLAG	= 'GET REPORT BY ID',
	@REPORT_ID	= 69




	SELECT * FROM [dbo].[CrashReportLIN]
	exec [dbo].[NSP_CrashReport]
	@FLAG	= 'CREATE CRASH REPORT',
	@WHEN	= '2025-01-06',
	@WHERE	= '/dashboard',
	@WHAT	= 'UNDEFINED MAP PROPERTY',
	@SEVERITY = 'High',
	@CREATED_BY = 1,
	@STACK_TRACE = 'TEST',
	@OS = 'WINDOWS',
	@BROWSER = 'CRHOME 130.0',
	@USER_AGENT = 'TEST',
	@EMAIL = 'admin@email.com',
	@SCENARIO = 'TESTING SCENARIO',
	@DETAILS = 'TESTING DETAILS'

*/
GO
/****** Object:  StoredProcedure [dbo].[NSP_UserPermission]    Script Date: 12/06/2025 10:04:55 am ******/
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
/****** Object:  Trigger [dbo].[UpdateRowIfLogPath]    Script Date: 12/06/2025 10:04:55 am ******/
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

END
GO
ALTER TABLE [dbo].[APILogs] ENABLE TRIGGER [UpdateRowIfLogPath]
GO
USE [master]
GO
ALTER DATABASE [YOUR_PROJECT_NAME] SET  READ_WRITE 
GO
