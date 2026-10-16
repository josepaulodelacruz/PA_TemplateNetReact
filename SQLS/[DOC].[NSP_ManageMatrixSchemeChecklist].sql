USE [EcastV2]
GO
/****** Object:  StoredProcedure [DOC].[NSP_ManageMatrixSchemeChecklist]    Script Date: 8/27/2026 3:05:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		JPDC
-- Create date: August 27, 2026
-- Description:	The Matrix tab of Document Setup - one financing scheme at a time,
--				shaped like the 'Consolidated Checklist of Requirements' workbook.
--
--				'GET CHECKLIST' hands the client three pieces it joins in memory:
--				the COLUMN headers, the document ROWS, and the ticked CELLS. The
--				columns are derived from the category setup, so adding a category
--				widens the matrix without touching this proc.
--
--				Run 'CREATE TABLE FOR DOC MATRIX.sql' and 'SEED FOR DOC MATRIX.sql'
--				before this script.
-- =============================================
ALTER PROCEDURE [DOC].[NSP_ManageMatrixSchemeChecklist]
	@FLAG							VARCHAR(80)		= ''

	/*WHICH TAB - EITHER ONE RESOLVES THE SCHEME, THE CODE IS WHAT THE CLIENT PASSES*/
,	@SCHEME_ID						INT				= NULL
,	@SCHEME_CODE					VARCHAR(40)		= NULL

	/*'GET LOOKUPS' - NULL RETURNS EVERY GROUP AT ONCE*/
,	@GROUP_CODE						VARCHAR(40)		= NULL

	/*ONE ROW OF THE TAB*/
,	@HDR_ID							INT				= 0		/*0 = INSERT, ANYTHING ELSE = UPDATE THAT ROW*/
,	@FILE_ID						INT				= 0		/*[DOC].[FilesDocumentHDR].[ID]*/
,	@SEQ_NO							INT				= NULL
,	@CONDITION_TEXT					VARCHAR(400)	= NULL
,	@SCANNED_COPY_ID				INT				= NULL
,	@DUE_DATE_ID					INT				= NULL
,	@MILESTONE_ID					INT				= NULL
,	@EXPIRY_ID						INT				= NULL
,	@SOURCE_ID						INT				= NULL
,	@IS_REQUIRED_FOR_COMMISSION		BIT				= NULL
,	@REMARKS						VARCHAR(MAX)	= NULL

	/*THE CHECKBOXES OF THAT ROW, POSTED WHOLE*/
,	@CELLS							[UDT].[DocMatrixCell]	READONLY

	/*OTHER PARAMS*/
,	@SEARCH							VARCHAR(200)	= ''
,	@USER							VARCHAR(80)		= NULL	/*THE USERNAME, NOT THE USERS.ID*/
AS
BEGIN
	SET NOCOUNT ON;

	SET @SEARCH = LTRIM(RTRIM(ISNULL(@SEARCH, '')));

	/*THE CODE IS THE STABLE KEY, SO IT WINS WHENEVER THE CALLER SENDS ONE*/
	IF LTRIM(RTRIM(ISNULL(@SCHEME_CODE, ''))) <> ''
	BEGIN
		SET @SCHEME_ID = (
			SELECT	[ID]
			FROM	[DOC].[FinancingScheme]
			WHERE	[CODE] = LTRIM(RTRIM(@SCHEME_CODE))
			AND		[IS_ACTIVE] = 1
		);
	END

	IF ISNULL(@SCHEME_ID, 0) = 0 SET @SCHEME_ID = NULL;

	-- =================================
	-- GET SCHEMES
	-- =================================
	/*THE TABS OF THE MATRIX SCREEN*/
	IF @FLAG = 'GET SCHEMES'
	BEGIN
		SELECT		fs.[ID]
				,	fs.[CODE]
				,	fs.[NAME]
				,	fs.[DESCRIPTION]
				,	fs.[SORT_ORDER]
					/*SO THE TAB CAN SHOW HOW FAR THE MAPPING HAS GOT*/
				,	(
						SELECT	COUNT(1)
						FROM	[DOC].[MatrixChecklistHDR] hdr
						WHERE	hdr.[SCHEME_ID] = fs.[ID]
						AND		hdr.[IS_ACTIVE] = 1
					) [DOCUMENT_COUNT]
		FROM		[DOC].[FinancingScheme] fs
		WHERE		fs.[IS_ACTIVE] = 1
		ORDER BY	ISNULL(fs.[SORT_ORDER], 2147483647), fs.[ID]
	END

	-- =================================
	-- GET LOOKUPS
	-- =================================
	/*EVERY SELECT OF THE ROW FORM IN ONE CALL - SCANNED_COPY, DUE_DATE, MILESTONE, EXPIRY, SOURCE*/
	IF @FLAG = 'GET LOOKUPS'
	BEGIN
		SELECT		ml.[ID]
				,	ml.[GROUP_CODE]
				,	ml.[VALUE]
				,	ml.[SORT_ORDER]
		FROM		[DOC].[MatrixLookup] ml
		WHERE		ml.[IS_ACTIVE] = 1
		AND			(LTRIM(RTRIM(ISNULL(@GROUP_CODE, ''))) = '' OR ml.[GROUP_CODE] = @GROUP_CODE)
		ORDER BY	ml.[GROUP_CODE], ISNULL(ml.[SORT_ORDER], 2147483647), ml.[ID]
	END

	-- =================================
	-- GET CHECKLIST (4 RESULT SETS)
	-- =================================
	IF @FLAG = 'GET CHECKLIST'
	BEGIN
		IF @SCHEME_ID IS NULL
		BEGIN
			RAISERROR('Financing scheme is required.', 16, 1);
			RETURN;
		END

		/*1 - THE SCHEME BEING SHOWN*/
		SELECT		fs.[ID]
				,	fs.[CODE]
				,	fs.[NAME]
				,	fs.[DESCRIPTION]
		FROM		[DOC].[FinancingScheme] fs
		WHERE		fs.[ID] = @SCHEME_ID
		AND			fs.[IS_ACTIVE] = 1

		/*
			2 - THE COLUMN HEADERS. [AXIS_NAME] IS THE MERGED TOP ROW OF THE WORKBOOK
			(Customer Type, Civil Status, ...) AND [COLUMN_LABEL] IS THE ROW UNDER IT.
		*/
		SELECT		col.[COLUMN_KEY]
				,	col.[MAIN_ID]
				,	col.[AXIS_NAME]
				,	col.[SUB_ID]
				,	col.[SUB_NAME]
				,	col.[OPTION_ID]
				,	col.[OPTION_LABEL]
				,	col.[COLUMN_LABEL]
				,	col.[ANSWER_TYPE]
		FROM		[DOC].[vw_MatrixColumn] col
		ORDER BY	col.[MAIN_ID]
				,	ISNULL(col.[SUB_ID], 0)
				,	ISNULL(col.[OPTION_ID], 0)

		/*3 - THE DOCUMENT ROWS OF THIS TAB, IN SECTION ORDER THEN IN THE TAB'S OWN 'No.' ORDER*/
		SELECT		hdr.[ID]
				,	hdr.[SCHEME_ID]
				,	hdr.[FILE_ID]
				,	fd.[TITLE]
				,	fd.[LABEL_ID]
				,	lb.[LABEL]							[SECTION]
				,	hdr.[SEQ_NO]
				,	hdr.[CONDITION_TEXT]
				,	hdr.[SCANNED_COPY_ID]
				,	sc.[VALUE]							[SCANNED_COPY]
				,	hdr.[DUE_DATE_ID]
				,	dd.[VALUE]							[DUE_DATE]
				,	hdr.[MILESTONE_ID]
				,	ms.[VALUE]							[MILESTONE]
				,	hdr.[EXPIRY_ID]
				,	ex.[VALUE]							[EXPIRY]
				,	hdr.[SOURCE_ID]
				,	so.[VALUE]							[SOURCE]
				,	hdr.[IS_REQUIRED_FOR_COMMISSION]
				,	hdr.[REMARKS]
				,	hdr.[CREATED_DATE]
				,	hdr.[CREATED_BY]
				,	hdr.[UPDATED_DATE]
				,	hdr.[UPDATED_BY]
		FROM		[DOC].[MatrixChecklistHDR]	hdr
		INNER JOIN	[DOC].[FilesDocumentHDR]	fd
		ON			fd.[ID] = hdr.[FILE_ID]
		LEFT JOIN	[DOC].[Labels]				lb
		ON			lb.[ID] = fd.[LABEL_ID]
		LEFT JOIN	[DOC].[MatrixLookup]		sc
		ON			sc.[ID] = hdr.[SCANNED_COPY_ID]
		LEFT JOIN	[DOC].[MatrixLookup]		dd
		ON			dd.[ID] = hdr.[DUE_DATE_ID]
		LEFT JOIN	[DOC].[MatrixLookup]		ms
		ON			ms.[ID] = hdr.[MILESTONE_ID]
		LEFT JOIN	[DOC].[MatrixLookup]		ex
		ON			ex.[ID] = hdr.[EXPIRY_ID]
		LEFT JOIN	[DOC].[MatrixLookup]		so
		ON			so.[ID] = hdr.[SOURCE_ID]
		WHERE		hdr.[SCHEME_ID] = @SCHEME_ID
		AND			hdr.[IS_ACTIVE] = 1
		AND			ISNULL(fd.[IS_ACTIVE], 1) = 1
		AND			(@SEARCH = '' OR CONVERT(NVARCHAR(MAX), fd.[TITLE]) LIKE '%' + @SEARCH + '%')
					/*A SECTION ADDED BEFORE [SORT_ORDER] EXISTED FALLS IN AFTER THE ORDERED ONES*/
		ORDER BY	ISNULL(lb.[SORT_ORDER], 2147483647)
				,	lb.[ID]
				,	ISNULL(hdr.[SEQ_NO], 2147483647)
				,	hdr.[ID]

		/*
			4 - THE TICKED CELLS. [COLUMN_KEY] IS REBUILT THE SAME WAY THE VIEW BUILDS IT,
			SO THE CLIENT LOOKS THE CELL UP BY [HDR_ID] + [COLUMN_KEY] AND NEEDS NO JOIN.
			A COLUMN WITH NO ROW HERE IS SIMPLY UNTICKED.
		*/
		SELECT		dtl.[HDR_ID]
				,	'M' + CAST(dtl.[MAIN_ID] AS VARCHAR(12))
					+ ISNULL('_S' + CAST(dtl.[SUB_ID] AS VARCHAR(12)), '')
					+ ISNULL('_O' + CAST(dtl.[OPTION_ID] AS VARCHAR(12)), '')	[COLUMN_KEY]
				,	dtl.[MAIN_ID]
				,	dtl.[SUB_ID]
				,	dtl.[OPTION_ID]
				,	dtl.[IS_APPLICABLE]
		FROM		[DOC].[MatrixChecklistDTL]	dtl
		INNER JOIN	[DOC].[MatrixChecklistHDR]	hdr
		ON			hdr.[ID] = dtl.[HDR_ID]
		INNER JOIN	[DOC].[FilesDocumentHDR]	fd
		ON			fd.[ID] = hdr.[FILE_ID]
		WHERE		hdr.[SCHEME_ID] = @SCHEME_ID
		AND			hdr.[IS_ACTIVE] = 1
		AND			ISNULL(fd.[IS_ACTIVE], 1) = 1
		AND			(@SEARCH = '' OR CONVERT(NVARCHAR(MAX), fd.[TITLE]) LIKE '%' + @SEARCH + '%')
	END

	-- =================================
	-- GET UNMAPPED DOCUMENTS
	-- =================================
	/*WHAT THE 'ADD DOCUMENT TO THIS SCHEME' PICKER OFFERS - EVERYTHING NOT ON THE TAB YET*/
	IF @FLAG = 'GET UNMAPPED DOCUMENTS'
	BEGIN
		IF @SCHEME_ID IS NULL
		BEGIN
			RAISERROR('Financing scheme is required.', 16, 1);
			RETURN;
		END

		SELECT		fd.[ID]
				,	fd.[TITLE]
				,	fd.[LABEL_ID]
				,	lb.[LABEL] [SECTION]
		FROM		[DOC].[FilesDocumentHDR]	fd
		LEFT JOIN	[DOC].[Labels]				lb
		ON			lb.[ID] = fd.[LABEL_ID]
		WHERE		ISNULL(fd.[IS_ACTIVE], 1) = 1
		AND			(@SEARCH = '' OR CONVERT(NVARCHAR(MAX), fd.[TITLE]) LIKE '%' + @SEARCH + '%')
		AND			NOT EXISTS (
						SELECT	1
						FROM	[DOC].[MatrixChecklistHDR] hdr
						WHERE	hdr.[SCHEME_ID] = @SCHEME_ID
						AND		hdr.[FILE_ID] = fd.[ID]
						AND		hdr.[IS_ACTIVE] = 1
					)
		ORDER BY	ISNULL(lb.[SORT_ORDER], 2147483647), lb.[ID], fd.[ID]
	END

	-- =================================
	-- SAVE CHECKLIST ROW
	-- =================================
	IF @FLAG = 'SAVE CHECKLIST ROW'
	BEGIN
		IF @SCHEME_ID IS NULL
		BEGIN
			RAISERROR('Financing scheme is required.', 16, 1);
			RETURN;
		END

		IF ISNULL(@FILE_ID, 0) = 0
		BEGIN
			RAISERROR('Document is required.', 16, 1);
			RETURN;
		END

		IF NOT EXISTS (
			SELECT	1
			FROM	[DOC].[FilesDocumentHDR]
			WHERE	[ID] = @FILE_ID
			AND		ISNULL([IS_ACTIVE], 1) = 1
		)
		BEGIN
			RAISERROR('Document does not exist.', 16, 1);
			RETURN;
		END

		/*A SOFT DELETED ROW IS NOT UPDATABLE - IT HAS TO BE ADDED TO THE SCHEME AGAIN*/
		IF ISNULL(@HDR_ID, 0) <> 0
		AND NOT EXISTS (
			SELECT	1
			FROM	[DOC].[MatrixChecklistHDR]
			WHERE	[ID] = @HDR_ID
			AND		[IS_ACTIVE] = 1
		)
		BEGIN
			RAISERROR('Checklist row does not exist.', 16, 1);
			RETURN;
		END

		IF EXISTS (
			SELECT	1
			FROM	[DOC].[MatrixChecklistHDR]
			WHERE	[SCHEME_ID] = @SCHEME_ID
			AND		[FILE_ID] = @FILE_ID
			AND		[IS_ACTIVE] = 1
			AND		[ID] <> ISNULL(@HDR_ID, 0)
		)
		BEGIN
			RAISERROR('This document is already on the checklist of this financing scheme.', 16, 1);
			RETURN;
		END

		/*A LOOKUP HAS TO COME FROM ITS OWN GROUP - AN EXPIRY ID IN THE DUE DATE SLOT IS A BUG, NOT A CHOICE*/
		IF (@SCANNED_COPY_ID	IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [DOC].[MatrixLookup] WHERE [ID] = @SCANNED_COPY_ID	AND [GROUP_CODE] = 'SCANNED_COPY'	AND [IS_ACTIVE] = 1))
		OR (@DUE_DATE_ID		IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [DOC].[MatrixLookup] WHERE [ID] = @DUE_DATE_ID		AND [GROUP_CODE] = 'DUE_DATE'		AND [IS_ACTIVE] = 1))
		OR (@MILESTONE_ID		IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [DOC].[MatrixLookup] WHERE [ID] = @MILESTONE_ID		AND [GROUP_CODE] = 'MILESTONE'		AND [IS_ACTIVE] = 1))
		OR (@EXPIRY_ID			IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [DOC].[MatrixLookup] WHERE [ID] = @EXPIRY_ID			AND [GROUP_CODE] = 'EXPIRY'			AND [IS_ACTIVE] = 1))
		OR (@SOURCE_ID			IS NOT NULL AND NOT EXISTS (SELECT 1 FROM [DOC].[MatrixLookup] WHERE [ID] = @SOURCE_ID			AND [GROUP_CODE] = 'SOURCE'			AND [IS_ACTIVE] = 1))
		BEGIN
			RAISERROR('One of the selected values does not belong to its column.', 16, 1);
			RETURN;
		END

		BEGIN TRY
			BEGIN TRANSACTION;

				IF ISNULL(@HDR_ID, 0) = 0
				BEGIN
					INSERT INTO [DOC].[MatrixChecklistHDR] (
							[SCHEME_ID]
						,	[FILE_ID]
						,	[SEQ_NO]
						,	[CONDITION_TEXT]
						,	[SCANNED_COPY_ID]
						,	[DUE_DATE_ID]
						,	[MILESTONE_ID]
						,	[EXPIRY_ID]
						,	[SOURCE_ID]
						,	[IS_REQUIRED_FOR_COMMISSION]
						,	[REMARKS]
						,	[CREATED_DATE]
						,	[CREATED_BY]
						,	[IS_ACTIVE]
					)
					VALUES (
							@SCHEME_ID
						,	@FILE_ID
						,	@SEQ_NO
						,	NULLIF(LTRIM(RTRIM(ISNULL(@CONDITION_TEXT, ''))), '')
						,	@SCANNED_COPY_ID
						,	@DUE_DATE_ID
						,	@MILESTONE_ID
						,	@EXPIRY_ID
						,	@SOURCE_ID
						,	@IS_REQUIRED_FOR_COMMISSION
						,	@REMARKS
						,	GETDATE()
						,	@USER
						,	1
					)

					SET @HDR_ID = CAST(SCOPE_IDENTITY() AS INT);
				END
				ELSE
				BEGIN
					UPDATE	[DOC].[MatrixChecklistHDR]
					SET		[SCHEME_ID]						= @SCHEME_ID
						,	[FILE_ID]						= @FILE_ID
						,	[SEQ_NO]						= @SEQ_NO
						,	[CONDITION_TEXT]				= NULLIF(LTRIM(RTRIM(ISNULL(@CONDITION_TEXT, ''))), '')
						,	[SCANNED_COPY_ID]				= @SCANNED_COPY_ID
						,	[DUE_DATE_ID]					= @DUE_DATE_ID
						,	[MILESTONE_ID]					= @MILESTONE_ID
						,	[EXPIRY_ID]						= @EXPIRY_ID
						,	[SOURCE_ID]						= @SOURCE_ID
						,	[IS_REQUIRED_FOR_COMMISSION]	= @IS_REQUIRED_FOR_COMMISSION
						,	[REMARKS]						= @REMARKS
						,	[UPDATED_DATE]					= GETDATE()
						,	[UPDATED_BY]					= @USER
					WHERE	[ID] = @HDR_ID
				END

				/*
					THE CHECKBOXES ARE POSTED WHOLE, SO THE ROW'S CELLS ARE REBUILT.
					JOINING THE VIEW DROPS ANY CELL THAT DOES NOT ADDRESS A REAL COLUMN,
					WHICH IS ALSO WHAT RETIRES THE CELLS OF A DEACTIVATED CATEGORY.
				*/
				DELETE FROM	[DOC].[MatrixChecklistDTL]
				WHERE		[HDR_ID] = @HDR_ID

				INSERT INTO [DOC].[MatrixChecklistDTL] (
						[HDR_ID]
					,	[MAIN_ID]
					,	[SUB_ID]
					,	[OPTION_ID]
					,	[IS_APPLICABLE]
				)
				SELECT		@HDR_ID
						,	col.[MAIN_ID]
						,	col.[SUB_ID]
						,	col.[OPTION_ID]
						,	MAX(CAST(cell.[IS_APPLICABLE] AS TINYINT))
				FROM		@CELLS						cell
				INNER JOIN	[DOC].[vw_MatrixColumn]		col
				ON			col.[MAIN_ID] = cell.[MAIN_ID]
				AND			ISNULL(col.[SUB_ID], 0) = ISNULL(cell.[SUB_ID], 0)
				AND			ISNULL(col.[OPTION_ID], 0) = ISNULL(cell.[OPTION_ID], 0)
				GROUP BY	col.[MAIN_ID]
						,	col.[SUB_ID]
						,	col.[OPTION_ID]

			COMMIT TRANSACTION;
		END TRY
		BEGIN CATCH
			IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;

			THROW;
		END CATCH

		/*THE CALLER READS THIS BACK WITH ExecuteScalar TO LEARN THE NEW IDENTITY*/
		SELECT @HDR_ID [ID];
	END

	-- =================================
	-- DELETE CHECKLIST ROW
	-- =================================
	IF @FLAG = 'DELETE CHECKLIST ROW'
	BEGIN
		IF NOT EXISTS (
			SELECT	1
			FROM	[DOC].[MatrixChecklistHDR]
			WHERE	[ID] = @HDR_ID
			AND		[IS_ACTIVE] = 1
		)
		BEGIN
			RAISERROR('Checklist row does not exist.', 16, 1);
			RETURN;
		END

		/*SOFT DELETE - THE TICKS STAY AS HISTORY AND COME BACK IF THE ROW IS RESTORED*/
		UPDATE	[DOC].[MatrixChecklistHDR]
		SET		[IS_ACTIVE]		= 0
			,	[UPDATED_DATE]	= GETDATE()
			,	[UPDATED_BY]	= @USER
		WHERE	[ID] = @HDR_ID
		AND		[IS_ACTIVE] = 1
	END
END


-- EXEC [DOC].[NSP_ManageMatrixSchemeChecklist] @FLAG = 'GET SCHEMES'
-- EXEC [DOC].[NSP_ManageMatrixSchemeChecklist] @FLAG = 'GET LOOKUPS'
-- EXEC [DOC].[NSP_ManageMatrixSchemeChecklist] @FLAG = 'GET CHECKLIST', @SCHEME_CODE = 'BANK'
-- EXEC [DOC].[NSP_ManageMatrixSchemeChecklist] @FLAG = 'GET UNMAPPED DOCUMENTS', @SCHEME_CODE = 'BANK'
