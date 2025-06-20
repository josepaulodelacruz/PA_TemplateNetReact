USE [YOUR_PROJECT_NAME]
GO
/****** Object:  Schema [UDT]    Script Date: 19/06/2025 8:30:41 pm ******/
CREATE SCHEMA [UDT]
GO
/****** Object:  UserDefinedTableType [UDT].[CrashReportIMG]    Script Date: 19/06/2025 8:30:41 pm ******/
CREATE TYPE [UDT].[CrashReportIMG] AS TABLE(
	[IMG] [nvarchar](max) NULL
)
GO
/****** Object:  UserDefinedTableType [UDT].[UserPermission]    Script Date: 19/06/2025 8:30:41 pm ******/
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
/****** Object:  UserDefinedFunction [dbo].[fnSplitString]    Script Date: 19/06/2025 8:30:41 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[fnSplitString]
(
    @Input NVARCHAR(MAX)
)
RETURNS @Result TABLE
(
    Value VARCHAR(100)
)
AS
BEGIN
    DECLARE @Pos INT = 0
    DECLARE @NextPos INT
    DECLARE @Item NVARCHAR(100)

    WHILE CHARINDEX(',', @Input, @Pos + 1) > 0
    BEGIN
        SET @NextPos = CHARINDEX(',', @Input, @Pos + 1)
        SET @Item = SUBSTRING(@Input, @Pos + 1, @NextPos - @Pos - 1)
        INSERT INTO @Result (Value) VALUES (LTRIM(RTRIM(@Item)))
        SET @Pos = @NextPos
    END

    -- Add last item
    SET @Item = SUBSTRING(@Input, @Pos + 1, LEN(@Input) - @Pos)
    INSERT INTO @Result (Value) VALUES (LTRIM(RTRIM(@Item)))

    RETURN
END
GO
/****** Object:  Table [dbo].[APILogs]    Script Date: 19/06/2025 8:30:41 pm ******/
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
/****** Object:  Table [dbo].[CrashReportHDR]    Script Date: 19/06/2025 8:30:41 pm ******/
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
/****** Object:  Table [dbo].[CrashReportIMG]    Script Date: 19/06/2025 8:30:41 pm ******/
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
/****** Object:  Table [dbo].[CrashReportLIN]    Script Date: 19/06/2025 8:30:41 pm ******/
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
/****** Object:  Table [dbo].[ModuleItems]    Script Date: 19/06/2025 8:30:41 pm ******/
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
/****** Object:  Table [dbo].[RoleType]    Script Date: 19/06/2025 8:30:41 pm ******/
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
/****** Object:  Table [dbo].[UserPermissions]    Script Date: 19/06/2025 8:30:41 pm ******/
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
/****** Object:  Table [dbo].[USERS]    Script Date: 19/06/2025 8:30:41 pm ******/
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
/****** Object:  Table [dbo].[UserSessions]    Script Date: 19/06/2025 8:30:41 pm ******/
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
/****** Object:  StoredProcedure [dbo].[NSP_APILogs]    Script Date: 19/06/2025 8:30:41 pm ******/
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
/****** Object:  StoredProcedure [dbo].[NSP_CrashReport]    Script Date: 19/06/2025 8:30:41 pm ******/
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
,	@FilterType		VARCHAR(80)  = ''

	/*FILTERS*/
,	@F_SEVERITY		NVARCHAR(MAX) = NULL

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
					hdr.[ID] [MAIN_ID]
				,	hdr.[WHEN]
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
			WHERE (
				@F_SEVERITY IS NULL
				OR hdr.SEVERITY_LEVEL IN (SELECT Value FROM dbo.fnSplitString(@F_SEVERITY))
			)
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
					hdr.[ID]
				,	hdr.[WHEN]
				,	hdr.[WHERE]
				,	hdr.[WHAT]
				,	hdr.[SEVERITY_LEVEL]
				,	hdr.[LOG_ID]
				,	usr.[USERNAME] [CREATED_BY]
				,	lin.*
				,	img.[IMG]
		FROM		dbo.[CrashReportHDR] hdr
		JOIN		dbo.[CrashReportLIN] lin
		ON			hdr.ID = lin.[HDR_ID]
		LEFT JOIN	dbo.[CrashReportIMG] img
		ON			hdr.ID = img.[HDR_ID]
		AND			lin.ID = img.[LIN_ID]
		JOIN		dbo.[USERS] usr
		ON			hdr.[CREATED_BY] = usr.ID
		WHERE		hdr.[ID] = @REPORT_ID
	END

	IF @FLAG = 'GET METRICS'
	BEGIN
		-- Crash Reports Dashboard Query with Month Filtering (SQL Server 2012 Compatible)
		-- Replace @FilterType with: 'TODAY', 'YESTERDAY', 'WEEK', 'MONTH', 'ALL_TIME'
		-- Replace @SelectedDate with specific date if needed (format: 'YYYY-MM-DD')

		DECLARE @SelectedDate DATE = GETDATE(); -- Current date or specific date

		WITH FilteredCrashes AS (
			SELECT 
				hdr.[WHAT],
				hdr.[WHEN],
				hdr.[WHERE],
				hdr.[SEVERITY_LEVEL],
				lin.*,
				-- Calculate previous period for comparison
				CASE 
					WHEN @FilterType = 'TODAY' AND CAST(hdr.[WHEN] AS DATE) = CAST(@SelectedDate AS DATE) THEN 1
					WHEN @FilterType = 'YESTERDAY' AND CAST(hdr.[WHEN] AS DATE) = CAST(DATEADD(day, -1, @SelectedDate) AS DATE) THEN 1
					WHEN @FilterType = 'WEEK' AND hdr.[WHEN] >= DATEADD(day, -7, @SelectedDate) AND hdr.[WHEN] <= @SelectedDate THEN 1
					WHEN @FilterType = 'MONTH' AND hdr.[WHEN] >= DATEADD(day, -30, @SelectedDate) AND hdr.[WHEN] <= @SelectedDate THEN 1
					WHEN @FilterType = 'ALL_TIME' THEN 1
					ELSE 0
				END AS IsCurrentPeriod,
        
				CASE 
					WHEN @FilterType = 'TODAY' AND CAST(hdr.[WHEN] AS DATE) = CAST(DATEADD(day, -1, @SelectedDate) AS DATE) THEN 1
					WHEN @FilterType = 'YESTERDAY' AND CAST(hdr.[WHEN] AS DATE) = CAST(DATEADD(day, -2, @SelectedDate) AS DATE) THEN 1
					WHEN @FilterType = 'WEEK' AND hdr.[WHEN] >= DATEADD(day, -14, @SelectedDate) AND hdr.[WHEN] < DATEADD(day, -7, @SelectedDate) THEN 1
					WHEN @FilterType = 'MONTH' AND hdr.[WHEN] >= DATEADD(day, -60, @SelectedDate) AND hdr.[WHEN] < DATEADD(day, -30, @SelectedDate) THEN 1
					ELSE 0
				END AS IsPreviousPeriod
			FROM dbo.[CrashReportHDR] hdr
			JOIN dbo.[CrashReportLIN] lin ON hdr.[ID] = lin.[HDR_ID]
		),

		DashboardMetrics AS (
			SELECT 
				-- Current Period Metrics
				COUNT(CASE WHEN IsCurrentPeriod = 1 THEN 1 END) AS TotalCrashes,
				COUNT(DISTINCT CASE WHEN IsCurrentPeriod = 1 THEN EMAIL END) AS AffectedUsers,
				COUNT(CASE WHEN IsCurrentPeriod = 1 AND SEVERITY_LEVEL = 'critical' THEN 1 END) AS CriticalSystemFailures,
        
				-- Previous Period Metrics for comparison
				COUNT(CASE WHEN IsPreviousPeriod = 1 THEN 1 END) AS PreviousTotalCrashes,
				COUNT(DISTINCT CASE WHEN IsPreviousPeriod = 1 THEN EMAIL END) AS PreviousAffectedUsers,
				COUNT(CASE WHEN IsPreviousPeriod = 1 AND SEVERITY_LEVEL = 'critical' THEN 1 END) AS PreviousCriticalFailures,
        
				-- All Time Metrics for Crash Free Sessions calculation
				COUNT(*) AS AllTimeTotalSessions,
				COUNT(CASE WHEN SEVERITY_LEVEL IN ('critical', 'high') THEN 1 END) AS AllTimeCriticalSessions
			FROM FilteredCrashes
		),
		MainDashboardMetrics as (
			SELECT 
			-- Main Dashboard Metrics
			0 ID,
			TotalCrashes,
			AffectedUsers,
			CriticalSystemFailures,
    
			-- Calculate Crash Free Sessions (assuming total sessions - critical crashes)
			CASE 
				WHEN AllTimeTotalSessions > 0 
				THEN AllTimeTotalSessions - AllTimeCriticalSessions 
				ELSE 0 
			END AS CrashFreeSessions,
    
			-- Calculate percentage changes
			CASE 
				WHEN PreviousTotalCrashes > 0 
				THEN ROUND(((TotalCrashes - PreviousTotalCrashes) * 100.0 / PreviousTotalCrashes), 2)
				ELSE 0 
			END AS CrashesPercentChange,
    
			CASE 
				WHEN PreviousAffectedUsers > 0 
				THEN ROUND(((AffectedUsers - PreviousAffectedUsers) * 100.0 / PreviousAffectedUsers), 2)
				ELSE 0 
			END AS UsersPercentChange,
    
			CASE 
				WHEN PreviousCriticalFailures > 0 
				THEN ROUND(((CriticalSystemFailures - PreviousCriticalFailures) * 100.0 / PreviousCriticalFailures), 2)
				ELSE 0 
			END AS CriticalFailuresPercentChange,
    
			-- Crash Free Sessions percentage change (using same logic as total crashes)
			CASE 
				WHEN PreviousTotalCrashes > 0 
				THEN ROUND(((TotalCrashes - PreviousTotalCrashes) * 100.0 / PreviousTotalCrashes), 2)
				ELSE 0 
			END AS CrashFreeSessionsPercentChange

			FROM DashboardMetrics
		),
		ChartData AS (
			SELECT 
				CAST(hdr.[WHEN] AS DATE) AS CrashDate,
				COUNT(*) AS DailyCrashes,
				COUNT(DISTINCT EMAIL) AS DailyAffectedUsers,
				COUNT(CASE WHEN SEVERITY_LEVEL = 'critical' THEN 1 END) AS DailyCriticalCrashes
			FROM dbo.[CrashReportHDR] hdr
			JOIN dbo.[CrashReportLIN] lin ON hdr.[ID] = lin.[HDR_ID]
			WHERE 
				(@FilterType = 'TODAY' AND CAST(hdr.[WHEN] AS DATE) = CAST(@SelectedDate AS DATE))
				OR (@FilterType = 'YESTERDAY' AND CAST(hdr.[WHEN] AS DATE) = CAST(DATEADD(day, -1, @SelectedDate) AS DATE))
				OR (@FilterType = 'WEEK' AND hdr.[WHEN] >= DATEADD(day, -7, @SelectedDate))
				OR (@FilterType = 'MONTH' AND hdr.[WHEN] >= DATEADD(day, -30, @SelectedDate))
				OR (@FilterType = 'ALL_TIME')
			GROUP BY CAST(hdr.[WHEN] AS DATE)
		),
		ChartDataWithRowNum AS (
			SELECT 
				CrashDate,
				DailyCrashes,
				DailyAffectedUsers,
				DailyCriticalCrashes,
				ROW_NUMBER() OVER (ORDER BY CrashDate) AS RowNum
			FROM ChartData
		)
		SELECT 
			a1.*,
			c1.CrashDate,
			c1.DailyCrashes,
			c1.DailyAffectedUsers,
			c1.DailyCriticalCrashes,
			-- Running totals using correlated subqueries (SQL 2012 compatible)
			(SELECT SUM(c2.DailyCrashes) FROM ChartDataWithRowNum c2 WHERE c2.RowNum <= c1.RowNum) AS CumulativeCrashes,
			(SELECT SUM(c2.DailyAffectedUsers) FROM ChartDataWithRowNum c2 WHERE c2.RowNum <= c1.RowNum) AS CumulativeAffectedUsers,
			(SELECT SUM(c2.DailyCriticalCrashes) FROM ChartDataWithRowNum c2 WHERE c2.RowNum <= c1.RowNum) AS CumulativeCriticalCrashes
		FROM ChartDataWithRowNum c1, MainDashboardMetrics a1
		ORDER BY c1.CrashDate


	END

	IF @FLAG = 'GET LOG'
	BEGIN
		
		IF @LOG_ID IS NULL
		BEGIN
			RAISERROR('LOG ID IS REQUIRED', 16, 2)
		END

		SELECT	
				[Id]
			,	[UserId]
			,	[Timestamp]
			,	[Message]
			,	[RequestPath]
			,	[RequestMethod]
			,	[Body]
			,	[ResponseStatusCode]
			,	[Duration]
		FROM	APILogs
		WHERE	Id = @LOG_ID
			
	END



END

/*
	EXEC [dbo].[NSP_CrashReport]
	@FLAG = 'GET LOG',
	@LOG_ID = 4691

	EXEC [dbo].[NSP_CrashReport]
	@FLAG	= 'GET REPORTS',
	@PageNumber = 1,
	@PageSize = 10,
	@F_SEVERITY = "high, low"

	EXEC [dbo].[NSP_CrashReport]
	@FLAG	= 'GET REPORT BY ID',
	@REPORT_ID	= 69,
	
	EXEC [dbo].[NSP_CrashReport]
	@FLAG	= 'GET METRICS'
		



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
/****** Object:  StoredProcedure [dbo].[NSP_UserPermission]    Script Date: 19/06/2025 8:30:41 pm ******/
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
/****** Object:  Trigger [dbo].[UpdateRowIfLogPath]    Script Date: 19/06/2025 8:30:41 pm ******/
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
