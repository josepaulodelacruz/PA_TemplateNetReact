/*
	MATRIX SCHEME CHECKLIST - SCHEMA EXTENSION

	Models the 'Consolidated Checklist of Requirements' workbook on top of the
	existing DOC setup tables. Nothing here replaces what is already there:

		[DOC].[Labels]				= the workbook's section header
									  (BASIC REQUIREMENTS, PROOF OF INCOME, ...)
		[DOC].[FilesDocumentHDR]	= the workbook's 'Document / Requirement' column
		[DOC].[MainCategory]		= a matrix AXIS      (Customer Type, Civil Status, ...)
		[DOC].[SubCategory]			= a boolean COLUMN under that axis (Individual, Company, ...)
		[DOC].[Options]				= a string COLUMN under an axis or a sub-category

	What the workbook needs on top of that:

		[DOC].[FinancingScheme]		= one workbook TAB (BANK / HDMF / DF - IN-HOUSE / CASH)
		[DOC].[MatrixLookup]		= the repeated free-text answers of the tab columns
									  (Scanned Copy Allowed?, Due Date, Milestone, Expiring?, Source)
		[DOC].[MatrixChecklistHDR]	= one ROW of a tab: a document as it applies to one scheme,
									  plus that row's non-checkbox columns
		[DOC].[MatrixChecklistDTL]	= one CELL of the checkbox matrix - the 1/0 under
									  Customer Type / Required to Buyer / Civil Status / Employment Status

	Re-running the script is safe.
*/

-- =================================
-- DOC.Labels - SECTION ORDER
-- =================================
/*THE WORKBOOK'S SECTIONS ARE ORDERED, THE LABELS ARE NOT - ISNULL FALLS BACK TO THE ID*/
IF COL_LENGTH('DOC.Labels', 'SORT_ORDER') IS NULL
	ALTER TABLE [DOC].[Labels] ADD [SORT_ORDER] INT NULL
GO

-- =================================
-- DOC.FinancingScheme
-- =================================
IF OBJECT_ID('DOC.FinancingScheme', 'U') IS NULL
BEGIN
	CREATE TABLE [DOC].[FinancingScheme] (
		[ID]			INT IDENTITY(1,1) PRIMARY KEY
	,	[CODE]			VARCHAR(40)		NOT NULL	/*THE STABLE KEY THE CLIENT PASSES - BANK, HDMF, DF-INHOUSE, CASH*/
	,	[NAME]			VARCHAR(120)	NOT NULL	/*WHAT THE TAB IS CALLED ON SCREEN*/
	,	[DESCRIPTION]	VARCHAR(400)	NULL
	,	[SORT_ORDER]	INT				NULL
	,	[CREATED_DATE]	DATETIME		NOT NULL DEFAULT (GETDATE())
	,	[CREATED_BY]	BIGINT			NULL
	,	[IS_ACTIVE]		BIT				NOT NULL DEFAULT (1)	/*0 = SOFT DELETED, THE CODE BECOMES FREE TO ADD AGAIN*/
	)
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = 'UX_FinancingScheme_CODE' AND object_id = OBJECT_ID('DOC.FinancingScheme'))
	CREATE UNIQUE NONCLUSTERED INDEX [UX_FinancingScheme_CODE] ON [DOC].[FinancingScheme] ([CODE]) WHERE [IS_ACTIVE] = 1
GO

-- =================================
-- DOC.MatrixLookup
-- =================================
/*
	ONE TABLE FOR EVERY REPEATED ANSWER OF THE TAB COLUMNS, KEYED BY [GROUP_CODE]:

		SCANNED_COPY	Yes | No | Depends on document
		DUE_DATE		Upon Reservation | Within 30 Days from Reservation Date | ...
		MILESTONE		Reservation | Standard Requirements | Additional Requirements | ...
		EXPIRY			No | Yes, every 6 months | Yes, annually (tax year) | ...
		SOURCE			PA | JV | Both | Meeting Instruction

	THE CLIENT RENDERS EACH GROUP AS A SELECT, SO A NEW ANSWER IS A ROW, NOT A DEPLOY.
*/
IF OBJECT_ID('DOC.MatrixLookup', 'U') IS NULL
BEGIN
	CREATE TABLE [DOC].[MatrixLookup] (
		[ID]			INT IDENTITY(1,1) PRIMARY KEY
	,	[GROUP_CODE]	VARCHAR(40)		NOT NULL
	,	[VALUE]			VARCHAR(400)	NOT NULL
	,	[SORT_ORDER]	INT				NULL
	,	[CREATED_DATE]	DATETIME		NOT NULL DEFAULT (GETDATE())
	,	[CREATED_BY]	BIGINT			NULL
	,	[IS_ACTIVE]		BIT				NOT NULL DEFAULT (1)
	)
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = 'UX_MatrixLookup_GROUP_VALUE' AND object_id = OBJECT_ID('DOC.MatrixLookup'))
	CREATE UNIQUE NONCLUSTERED INDEX [UX_MatrixLookup_GROUP_VALUE] ON [DOC].[MatrixLookup] ([GROUP_CODE], [VALUE]) WHERE [IS_ACTIVE] = 1
GO

-- =================================
-- DOC.MatrixChecklistHDR
-- =================================
/*
	ONE ROW OF ONE TAB. THE SAME DOCUMENT APPEARS ON SEVERAL TABS AND ITS DUE DATE
	OR SCANNED-COPY RULE MAY DIFFER PER TAB, SO THE ATTRIBUTES LIVE HERE AND NOT
	ON [DOC].[FilesDocumentHDR].

	THE SECTION IS NOT REPEATED - IT COMES FROM [DOC].[FilesDocumentHDR].[LABEL_ID].
*/
IF OBJECT_ID('DOC.MatrixChecklistHDR', 'U') IS NULL
BEGIN
	CREATE TABLE [DOC].[MatrixChecklistHDR] (
		[ID]						INT IDENTITY(1,1) PRIMARY KEY
	,	[SCHEME_ID]					INT				NOT NULL	/*[DOC].[FinancingScheme].[ID] - WHICH TAB*/
	,	[FILE_ID]					INT				NOT NULL	/*[DOC].[FilesDocumentHDR].[ID] - WHICH DOCUMENT*/
	,	[SEQ_NO]					INT				NULL		/*THE 'No.' COLUMN, WITHIN THE TAB*/
	,	[CONDITION_TEXT]			VARCHAR(400)	NULL		/*'Applicable To / Condition'*/
	,	[SCANNED_COPY_ID]			INT				NULL		/*[DOC].[MatrixLookup] - GROUP_CODE 'SCANNED_COPY'*/
	,	[DUE_DATE_ID]				INT				NULL		/*[DOC].[MatrixLookup] - GROUP_CODE 'DUE_DATE'*/
	,	[MILESTONE_ID]				INT				NULL		/*[DOC].[MatrixLookup] - GROUP_CODE 'MILESTONE'*/
	,	[EXPIRY_ID]					INT				NULL		/*[DOC].[MatrixLookup] - GROUP_CODE 'EXPIRY'*/
	,	[SOURCE_ID]					INT				NULL		/*[DOC].[MatrixLookup] - GROUP_CODE 'SOURCE'*/
	,	[IS_REQUIRED_FOR_COMMISSION] BIT			NULL		/*NULL = NOT DECIDED YET, THE WORKBOOK'S DRAFT COLUMN*/
	,	[REMARKS]					VARCHAR(MAX)	NULL
	,	[CREATED_DATE]				DATETIME		NOT NULL DEFAULT (GETDATE())
	,	[CREATED_BY]				VARCHAR(80)		NULL		/*THE USERNAME, MATCHING [DOC].[FilesDocumentHDR]*/
	,	[UPDATED_DATE]				DATETIME		NULL
	,	[UPDATED_BY]				VARCHAR(80)		NULL
	,	[IS_ACTIVE]					BIT				NOT NULL DEFAULT (1)	/*0 = SOFT DELETED, THE DOCUMENT MAY BE MAPPED AGAIN*/
	,	CONSTRAINT [FK_MatrixChecklistHDR_Scheme]		FOREIGN KEY ([SCHEME_ID])		REFERENCES [DOC].[FinancingScheme] ([ID])
	,	CONSTRAINT [FK_MatrixChecklistHDR_File]			FOREIGN KEY ([FILE_ID])			REFERENCES [DOC].[FilesDocumentHDR] ([ID])
	,	CONSTRAINT [FK_MatrixChecklistHDR_ScannedCopy]	FOREIGN KEY ([SCANNED_COPY_ID])	REFERENCES [DOC].[MatrixLookup] ([ID])
	,	CONSTRAINT [FK_MatrixChecklistHDR_DueDate]		FOREIGN KEY ([DUE_DATE_ID])		REFERENCES [DOC].[MatrixLookup] ([ID])
	,	CONSTRAINT [FK_MatrixChecklistHDR_Milestone]	FOREIGN KEY ([MILESTONE_ID])	REFERENCES [DOC].[MatrixLookup] ([ID])
	,	CONSTRAINT [FK_MatrixChecklistHDR_Expiry]		FOREIGN KEY ([EXPIRY_ID])		REFERENCES [DOC].[MatrixLookup] ([ID])
	,	CONSTRAINT [FK_MatrixChecklistHDR_Source]		FOREIGN KEY ([SOURCE_ID])		REFERENCES [DOC].[MatrixLookup] ([ID])
	)
END
GO

/*A DOCUMENT IS LISTED ONCE PER TAB - A SOFT DELETED ROW DOES NOT HOLD THE SLOT*/
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = 'UX_MatrixChecklistHDR_SCHEME_FILE' AND object_id = OBJECT_ID('DOC.MatrixChecklistHDR'))
	CREATE UNIQUE NONCLUSTERED INDEX [UX_MatrixChecklistHDR_SCHEME_FILE] ON [DOC].[MatrixChecklistHDR] ([SCHEME_ID], [FILE_ID]) WHERE [IS_ACTIVE] = 1
GO

/*THE WHOLE TAB IS READ IN ONE GO, ALWAYS FILTERED BY THE SCHEME*/
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = 'IX_MatrixChecklistHDR_SCHEME_IS_ACTIVE' AND object_id = OBJECT_ID('DOC.MatrixChecklistHDR'))
	CREATE NONCLUSTERED INDEX [IX_MatrixChecklistHDR_SCHEME_IS_ACTIVE] ON [DOC].[MatrixChecklistHDR] ([SCHEME_ID], [IS_ACTIVE]) INCLUDE ([FILE_ID], [SEQ_NO])
GO

-- =================================
-- DOC.MatrixChecklistDTL
-- =================================
/*
	ONE CHECKBOX OF THE MATRIX. THE THREE IDS SAY WHICH COLUMN THE CELL SITS UNDER,
	AND EXACTLY ONE SHAPE IS VALID PER AXIS:

		SUB_ID NULL, OPTION_ID NULL		the axis is one boolean column
		SUB_ID NULL, OPTION_ID SET		the axis answers with a label, one column per option
		SUB_ID SET,  OPTION_ID NULL		the sub-category is one boolean column
		SUB_ID SET,  OPTION_ID SET		the sub-category answers with a label

	ONLY THE TICKED CELLS NEED A ROW - AN ABSENT CELL READS AS 0 ON THE CLIENT -
	BUT AN EXPLICIT 0 IS STORED TOO SO 'ANSWERED NO' AND 'NEVER ANSWERED' STAY APART.
*/
IF OBJECT_ID('DOC.MatrixChecklistDTL', 'U') IS NULL
BEGIN
	CREATE TABLE [DOC].[MatrixChecklistDTL] (
		[ID]			INT IDENTITY(1,1) PRIMARY KEY
	,	[HDR_ID]		INT		NOT NULL	/*[DOC].[MatrixChecklistHDR].[ID]*/
	,	[MAIN_ID]		INT		NOT NULL	/*[DOC].[MainCategory].[ID] - THE AXIS*/
	,	[SUB_ID]		INT		NULL		/*[DOC].[SubCategory].[ID]*/
	,	[OPTION_ID]		INT		NULL		/*[DOC].[Options].[ID]*/
	,	[IS_APPLICABLE]	BIT		NOT NULL DEFAULT (0)
	,	CONSTRAINT [FK_MatrixChecklistDTL_Hdr]		FOREIGN KEY ([HDR_ID])		REFERENCES [DOC].[MatrixChecklistHDR] ([ID]) ON DELETE CASCADE
	,	CONSTRAINT [FK_MatrixChecklistDTL_Main]		FOREIGN KEY ([MAIN_ID])		REFERENCES [DOC].[MainCategory] ([ID])
	,	CONSTRAINT [FK_MatrixChecklistDTL_Sub]		FOREIGN KEY ([SUB_ID])		REFERENCES [DOC].[SubCategory] ([ID])
	,	CONSTRAINT [FK_MatrixChecklistDTL_Option]	FOREIGN KEY ([OPTION_ID])	REFERENCES [DOC].[Options] ([ID])
	)
END
GO

/*SQL SERVER TREATS NULLS AS EQUAL HERE, WHICH IS EXACTLY THE RULE WE WANT - ONE CELL PER COLUMN*/
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE [name] = 'UX_MatrixChecklistDTL_CELL' AND object_id = OBJECT_ID('DOC.MatrixChecklistDTL'))
	CREATE UNIQUE NONCLUSTERED INDEX [UX_MatrixChecklistDTL_CELL] ON [DOC].[MatrixChecklistDTL] ([HDR_ID], [MAIN_ID], [SUB_ID], [OPTION_ID])
GO

-- =================================
-- DOC.vw_MatrixColumn
-- =================================
/*
	THE COLUMN HEADER OF THE MATRIX, DERIVED FROM THE CATEGORY SETUP - THERE IS NO
	SECOND PLACE TO MAINTAIN IT. A CATEGORY BECOMES ONE COLUMN OR SEVERAL DEPENDING
	ON HOW IT WAS SET UP, WHICH IS THE FOUR BRANCHES BELOW.

	[COLUMN_KEY] IS THE STABLE CELL ADDRESS THE CLIENT KEYS ITS CHECKBOXES ON, AND
	[DOC].[MatrixChecklistDTL] REBUILDS THE VERY SAME STRING FROM ITS THREE IDS.
*/
IF OBJECT_ID('DOC.vw_MatrixColumn', 'V') IS NOT NULL
	DROP VIEW [DOC].[vw_MatrixColumn]
GO

CREATE VIEW [DOC].[vw_MatrixColumn]
AS
	/*1 - THE AXIS ANSWERS YES/NO ON ITS OWN: ONE COLUMN*/
	SELECT		main.[ID]							[MAIN_ID]
			,	main.[NAME]							[AXIS_NAME]
			,	CAST(NULL AS INT)					[SUB_ID]
			,	CAST(NULL AS VARCHAR(80))			[SUB_NAME]
			,	CAST(NULL AS INT)					[OPTION_ID]
			,	CAST(NULL AS VARCHAR(MAX))			[OPTION_LABEL]
			,	CAST(main.[NAME] AS VARCHAR(MAX))	[COLUMN_LABEL]
			,	CAST('boolean' AS VARCHAR(80))		[ANSWER_TYPE]
			,	'M' + CAST(main.[ID] AS VARCHAR(12))	[COLUMN_KEY]
	FROM		[DOC].[MainCategory] main
	WHERE		main.[IS_ACTIVE] = 1
	AND			ISNULL(main.[IS_NO_SUBCATEGORY], 0) = 1
	AND			ISNULL(main.[OPTION_TYPE], 'boolean') <> 'string'

	UNION ALL

	/*2 - THE AXIS ANSWERS WITH A LABEL: ONE COLUMN PER OPTION*/
	SELECT		main.[ID]
			,	main.[NAME]
			,	NULL
			,	NULL
			,	opts.[ID]
			,	CAST(opts.[LABEL] AS VARCHAR(MAX))
			,	CAST(opts.[LABEL] AS VARCHAR(MAX))
			,	CAST('string' AS VARCHAR(80))
			,	'M' + CAST(main.[ID] AS VARCHAR(12)) + '_O' + CAST(opts.[ID] AS VARCHAR(12))
	FROM		[DOC].[MainCategory]	main
	INNER JOIN	[DOC].[Options]			opts
	ON			opts.[MAIN_CATEGORY_ID] = main.[ID]
	WHERE		main.[IS_ACTIVE] = 1
	AND			ISNULL(main.[IS_NO_SUBCATEGORY], 0) = 1
	AND			main.[OPTION_TYPE] = 'string'
	AND			opts.[IS_ACTIVE] = 1

	UNION ALL

	/*3 - A YES/NO SUB-CATEGORY: ONE COLUMN, WHICH IS HOW THE WORKBOOK'S AXES ARE BUILT*/
	SELECT		main.[ID]
			,	main.[NAME]
			,	sub.[ID]
			,	sub.[NAME]
			,	NULL
			,	NULL
			,	CAST(sub.[NAME] AS VARCHAR(MAX))
			,	CAST('boolean' AS VARCHAR(80))
			,	'M' + CAST(main.[ID] AS VARCHAR(12)) + '_S' + CAST(sub.[ID] AS VARCHAR(12))
	FROM		[DOC].[MainCategory]	main
	INNER JOIN	[DOC].[SubCategory]		sub
	ON			sub.[MAIN_ID] = main.[ID]
	WHERE		main.[IS_ACTIVE] = 1
	AND			ISNULL(main.[IS_NO_SUBCATEGORY], 0) = 0
	AND			sub.[IS_ACTIVE] = 1
	AND			ISNULL(sub.[OPTION_TYPE], 'boolean') <> 'string'

	UNION ALL

	/*4 - A SUB-CATEGORY THAT ANSWERS WITH A LABEL: ONE COLUMN PER OPTION*/
	SELECT		main.[ID]
			,	main.[NAME]
			,	sub.[ID]
			,	sub.[NAME]
			,	opts.[ID]
			,	CAST(opts.[LABEL] AS VARCHAR(MAX))
			,	CAST(opts.[LABEL] AS VARCHAR(MAX))
			,	CAST('string' AS VARCHAR(80))
			,	'M' + CAST(main.[ID] AS VARCHAR(12)) + '_S' + CAST(sub.[ID] AS VARCHAR(12)) + '_O' + CAST(opts.[ID] AS VARCHAR(12))
	FROM		[DOC].[MainCategory]	main
	INNER JOIN	[DOC].[SubCategory]		sub
	ON			sub.[MAIN_ID] = main.[ID]
	INNER JOIN	[DOC].[Options]			opts
	ON			opts.[SUB_CATEGORY_ID] = sub.[ID]
	WHERE		main.[IS_ACTIVE] = 1
	AND			ISNULL(main.[IS_NO_SUBCATEGORY], 0) = 0
	AND			sub.[IS_ACTIVE] = 1
	AND			sub.[OPTION_TYPE] = 'string'
	AND			opts.[IS_ACTIVE] = 1
GO

-- =================================
-- UDT.DocMatrixCell
-- =================================
/*THE CELLS OF ONE ROW, POSTED IN ONE GO BY 'SAVE CHECKLIST ROW'*/
IF TYPE_ID('UDT.DocMatrixCell') IS NULL
BEGIN
	EXEC('
		CREATE TYPE [UDT].[DocMatrixCell] AS TABLE(
			[MAIN_ID]		INT		NOT NULL
		,	[SUB_ID]		INT		NULL
		,	[OPTION_ID]		INT		NULL
		,	[IS_APPLICABLE]	BIT		NOT NULL
		)
	')
END
GO
