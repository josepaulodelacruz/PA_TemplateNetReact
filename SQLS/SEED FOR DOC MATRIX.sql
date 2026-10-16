/*
	MATRIX SCHEME CHECKLIST - REFERENCE DATA

	Loads the fixed parts of the 'Consolidated Checklist of Requirements' workbook:
	the four tabs, the section headers, the four checkbox axes and the repeated
	answers of the tab columns.

	It does NOT load the documents or the ticks themselves - those are captured
	through the Documents tab and the Matrix screen.

	Run 'CREATE TABLE FOR DOC MATRIX.sql' first. Re-running is safe: every insert
	is guarded, so an entry an operator has since renamed or deactivated is left
	alone rather than resurrected.
*/

-- =================================
-- FINANCING SCHEMES (THE TABS)
-- =================================
INSERT INTO [DOC].[FinancingScheme] ([CODE], [NAME], [DESCRIPTION], [SORT_ORDER], [IS_ACTIVE])
SELECT		src.[CODE], src.[NAME], src.[DESCRIPTION], src.[SORT_ORDER], 1
FROM		(VALUES
				('BANK',		'Bank Financing',				'Checklist of Requirements - Bank Financing',			1)
			,	('HDMF',		'HDMF (Pag-IBIG) Financing',	'Checklist of Requirements - HDMF (Pag-IBIG) Financing',	2)
			,	('DF-INHOUSE',	'DF - In-House Financing',		'Checklist of Requirements - Direct Financing / In-House',3)
			,	('CASH',		'Cash',							'Checklist of Requirements - Cash',						4)
			) src ([CODE], [NAME], [DESCRIPTION], [SORT_ORDER])
WHERE NOT EXISTS (
	SELECT	1
	FROM	[DOC].[FinancingScheme] fs
	WHERE	fs.[CODE] = src.[CODE]
)
GO

-- =================================
-- SECTION HEADERS ([DOC].[Labels])
-- =================================
/*THE WORKBOOK'S 'Category' COLUMN - EACH TAB IS BROKEN INTO THESE, IN THIS ORDER*/
INSERT INTO [DOC].[Labels] ([LABEL], [SORT_ORDER], [IS_ACTIVE], [CREATED_DATE])
SELECT		src.[LABEL], src.[SORT_ORDER], 1, GETDATE()
FROM		(VALUES
				('BASIC REQUIREMENTS',			1)
			,	('PROOF OF INCOME',				2)
			,	('PROOF OF IDENTIFICATION',		3)
			,	('CIVIL STATUS DOCUMENTS',		4)
			,	('LOAN & LEGAL DOCUMENTS',		5)
			,	('OTHERS (IF APPLICABLE)',		6)
			,	('RE-DOCUMENTATION SUBMISSION',	7)
			) src ([LABEL], [SORT_ORDER])
WHERE NOT EXISTS (
	SELECT	1
	FROM	[DOC].[Labels] lb
	WHERE	lb.[LABEL] = src.[LABEL]
)
GO

/*A LABEL THAT PREDATES THE COLUMN SORTS AFTER THE SEEDED ONES, BY ITS OWN ID*/
UPDATE		lb
SET			lb.[SORT_ORDER] = src.[SORT_ORDER]
FROM		[DOC].[Labels] lb
INNER JOIN	(VALUES
				('BASIC REQUIREMENTS',			1)
			,	('PROOF OF INCOME',				2)
			,	('PROOF OF IDENTIFICATION',		3)
			,	('CIVIL STATUS DOCUMENTS',		4)
			,	('LOAN & LEGAL DOCUMENTS',		5)
			,	('OTHERS (IF APPLICABLE)',		6)
			,	('RE-DOCUMENTATION SUBMISSION',	7)
			) src ([LABEL], [SORT_ORDER])
ON			lb.[LABEL] = src.[LABEL]
WHERE		lb.[SORT_ORDER] IS NULL
GO

-- =================================
-- LOOKUPS (THE TAB COLUMNS THAT ANSWER WITH TEXT)
-- =================================
INSERT INTO [DOC].[MatrixLookup] ([GROUP_CODE], [VALUE], [SORT_ORDER], [IS_ACTIVE])
SELECT		src.[GROUP_CODE], src.[VALUE], src.[SORT_ORDER], 1
FROM		(VALUES
				/*'Scanned Copy Allowed?' - 'No' MEANS THE ORIGINAL / WET COPY IS REQUIRED*/
				('SCANNED_COPY',	'Yes',														1)
			,	('SCANNED_COPY',	'No',														2)
			,	('SCANNED_COPY',	'Depends on document',										3)

				/*'Due Date' - THE RULES SPELLED OUT ON THE WORKBOOK'S READ ME TAB*/
			,	('DUE_DATE',		'Upon Reservation',											1)
			,	('DUE_DATE',		'Upon Reservation (Non-RFO units) / Within 30 Days from Reservation (RFO units)', 2)
			,	('DUE_DATE',		'Within 30 Days from Reservation Date',						3)
			,	('DUE_DATE',		'Within 90 Days from Reservation Date (SPA)',				4)
			,	('DUE_DATE',		'Within 4 Months from Reservation Date',					5)
				/*ANCHORED TO THE BUYER'S OWN DP COMPLETION DATE, NOT TO THE RESERVATION DATE*/
			,	('DUE_DATE',		'4 Months Before Full Downpayment Date (Remaining 4 Months of DP)', 6)
			,	('DUE_DATE',		'2 Months Before Full Downpayment Date',					7)

				/*'Milestone / Stage'*/
			,	('MILESTONE',		'Reservation',												1)
			,	('MILESTONE',		'Standard Requirements',									2)
			,	('MILESTONE',		'SPA Submission',											3)
			,	('MILESTONE',		'Additional Requirements',									4)
			,	('MILESTONE',		'Additional Requirements (COEC)',							5)
			,	('MILESTONE',		'Re-Documentation',											6)

				/*'Expiring?' - HOW OFTEN THE DOCUMENT HAS TO BE RE-SUBMITTED*/
			,	('EXPIRY',			'No',														1)
			,	('EXPIRY',			'Yes, every 3-6 months',									2)
			,	('EXPIRY',			'Yes, every 6 months',										3)
			,	('EXPIRY',			'Yes, annually',											4)
			,	('EXPIRY',			'Yes, annually (tax year)',									5)
			,	('EXPIRY',			'Yes, per ID''s own expiry date',							6)
			,	('EXPIRY',			'Yes, per passport expiry date',							7)
			,	('EXPIRY',			'Yes, per contract validity',								8)
			,	('EXPIRY',			'Yes, per notarization validity (typically 1 year)',		9)

				/*'Source (PA / JV / Both)'*/
			,	('SOURCE',			'PA',														1)
			,	('SOURCE',			'JV',														2)
			,	('SOURCE',			'Both',														3)
			,	('SOURCE',			'Meeting Instruction',										4)
			) src ([GROUP_CODE], [VALUE], [SORT_ORDER])
WHERE NOT EXISTS (
	SELECT	1
	FROM	[DOC].[MatrixLookup] ml
	WHERE	ml.[GROUP_CODE] = src.[GROUP_CODE]
	AND		ml.[VALUE] = src.[VALUE]
)
GO

-- =================================
-- THE CHECKBOX AXES
-- =================================
/*
	EACH AXIS IS A MAIN CATEGORY WITH ONE BOOLEAN SUB-CATEGORY PER COLUMN, WHICH IS
	THE SAME SHAPE THE CATEGORY SCREEN PRODUCES - THE MATRIX ADDS NO SPECIAL CASE.

	'Financing' IS DELIBERATELY NOT AN AXIS: IT IS [DOC].[FinancingScheme], BECAUSE
	THE WORKBOOK GIVES EACH FINANCING TYPE ITS OWN TAB WITH ITS OWN DUE DATES.
*/
DECLARE @xAxis TABLE (
	[AXIS]		VARCHAR(80)
,	[AXIS_SEQ]	INT
,	[COLUMN]	VARCHAR(80)
,	[SEQ]		INT
)

INSERT INTO @xAxis ([AXIS], [AXIS_SEQ], [COLUMN], [SEQ])
VALUES	('Customer Type',		1,	'Individual',				1)
	,	('Customer Type',		1,	'Company',					2)

	,	('Required to Buyer',	2,	'Principal Buyer',			1)
	,	('Required to Buyer',	2,	'Spouse',					2)
	,	('Required to Buyer',	2,	'Co-Borrower',				3)
	,	('Required to Buyer',	2,	'Co-Borrower''s Spouse',	4)
	,	('Required to Buyer',	2,	'Attorney-in-Fact (AIF)',	5)

	,	('Civil Status',		3,	'Single',					1)
	,	('Civil Status',		3,	'Married',					2)
	,	('Civil Status',		3,	'Widow / Widower',			3)
	,	('Civil Status',		3,	'Annulled / Divorce',		4)
	,	('Civil Status',		3,	'Legally Separated',		5)

	,	('Employment Status',	4,	'Locally Employed',			1)
	,	('Employment Status',	4,	'With Business',			2)
	,	('Employment Status',	4,	'OFW',						3)

/*THE MATRIX ORDERS ITS COLUMNS BY IDENTITY, SO THE AXES ARE INSERTED IN WORKBOOK ORDER*/
INSERT INTO [DOC].[MainCategory] ([NAME], [IS_NO_SUBCATEGORY], [OPTION_TYPE], [CREATED_DATE], [IS_ACTIVE])
SELECT		src.[AXIS], 0, NULL, GETDATE(), 1
FROM		(SELECT [AXIS], [AXIS_SEQ] FROM @xAxis GROUP BY [AXIS], [AXIS_SEQ]) src
WHERE NOT EXISTS (
	SELECT	1
	FROM	[DOC].[MainCategory] mc
	WHERE	mc.[NAME] = src.[AXIS]
	AND		mc.[IS_ACTIVE] = 1
)
ORDER BY	src.[AXIS_SEQ]

INSERT INTO [DOC].[SubCategory] ([NAME], [MAIN_ID], [OPTION_TYPE], [CREATED_DATE], [IS_ACTIVE])
SELECT		src.[COLUMN], mc.[ID], 'boolean', GETDATE(), 1
FROM		@xAxis src
INNER JOIN	[DOC].[MainCategory] mc
ON			mc.[NAME] = src.[AXIS]
AND			mc.[IS_ACTIVE] = 1
WHERE NOT EXISTS (
	SELECT	1
	FROM	[DOC].[SubCategory] sc
	WHERE	sc.[MAIN_ID] = mc.[ID]
	AND		sc.[NAME] = src.[COLUMN]
	AND		sc.[IS_ACTIVE] = 1
)
ORDER BY	mc.[ID], src.[SEQ]
GO
