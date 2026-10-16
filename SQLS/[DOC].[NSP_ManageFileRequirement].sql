USE [EcastV2]
GO
/****** Object:  StoredProcedure [DOC].[NSP_ManageFileRequirements]    Script Date: 8/25/2026 2:17:39 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		JPDC
-- Create date: August 19, 2026
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [DOC].[NSP_ManageFileRequirements]
	@FLAG		VARCHAR(80)		= ''
,	@FILE_ID	INT				= 0		/*0 = INSERT, ANYTHING ELSE = UPDATE THAT ROW*/
,	@TITLE		NVARCHAR(200)	= ''
,	@LABEL_ID	INT				= 0
,	@USER		VARCHAR(80)		= NULL	/*[DOC].[FilesDocumentHDR].[CREATED_BY] / [UPDATED_BY] ARE VARCHAR(80), NOT THE USERS.ID*/
AS
BEGIN
	SET NOCOUNT ON;

	IF @FLAG = 'GET LABELS'
	BEGIN
		SELECT ID, [LABEL] FROM [DOC].[Labels] WHERE IS_ACTIVE = 1
	END

  IF @FLAG = 'GET DOCUMENT FILES'
  BEGIN
    SELECT
      hdr.[ID]
    ,	hdr.[TITLE]
    ,	hdr.[LABEL_ID]	/*THE CLIENT GROUPS BY THE ID - THE TABS ARE KEYED BY [DOC].[Labels].[ID], NOT BY THE TEXT*/
    ,	lb.[LABEL]
    FROM [DOC].[FilesDocumentHDR] hdr
    JOIN [DOC].[Labels] lb
    ON hdr.[LABEL_ID] = lb.[ID]
    WHERE hdr.[IS_ACTIVE] = 1
    ORDER BY lb.[LABEL], hdr.[ID]
  END

	-- =================================
	-- CREATE/UPDATE FILE DOCUMENT
	-- =================================
	IF @FLAG = 'CREATE/UPDATE FILE DOCUMENT'
	BEGIN
		SET @TITLE = LTRIM(RTRIM(ISNULL(@TITLE, '')));

		IF @TITLE = ''
		BEGIN
			RAISERROR('Document is required.', 16, 1);
			RETURN;
		END

		IF ISNULL(@LABEL_ID, 0) = 0
		BEGIN
			RAISERROR('Document type is required.', 16, 1);
			RETURN;
		END

		IF NOT EXISTS (
			SELECT	1
			FROM	[DOC].[Labels]
			WHERE	[ID] = @LABEL_ID
			AND		[IS_ACTIVE] = 1
		)
		BEGIN
			RAISERROR('Document type does not exist.', 16, 1);
			RETURN;
		END

		/*A SOFT DELETED ROW IS NOT UPDATABLE - IT HAS TO BE ADDED AGAIN*/
		IF ISNULL(@FILE_ID, 0) <> 0
		AND NOT EXISTS (
			SELECT	1
			FROM	[DOC].[FilesDocumentHDR]
			WHERE	[ID] = @FILE_ID
			AND		ISNULL([IS_ACTIVE], 1) = 1
		)
		BEGIN
			RAISERROR('Document does not exist.', 16, 1);
			RETURN;
		END

		/*THE SAME TITLE MAY LIVE UNDER A DIFFERENT DOCUMENT TYPE, SO THE LABEL IS PART OF THE CHECK*/
		IF EXISTS (
			SELECT	1
			FROM	[DOC].[FilesDocumentHDR]
			WHERE	CONVERT(NVARCHAR(200), [TITLE]) = @TITLE
			AND		[LABEL_ID] = @LABEL_ID
			AND		ISNULL([IS_ACTIVE], 1) = 1
			AND		[ID] <> ISNULL(@FILE_ID, 0)
		)
		BEGIN
			RAISERROR('Document already exists for this document type.', 16, 1);
			RETURN;
		END

		BEGIN TRY
			BEGIN TRANSACTION;

				IF ISNULL(@FILE_ID, 0) = 0
				BEGIN
					INSERT INTO [DOC].[FilesDocumentHDR] (
							[TITLE]
						,	[LABEL_ID]
						,	[IS_ACTIVE]
						,	[CREATED_DATE]
						,	[CREATED_BY]
					)
					VALUES (
							@TITLE
						,	@LABEL_ID
						,	1
						,	GETDATE()
						,	@USER
					)

					SET @FILE_ID = CAST(SCOPE_IDENTITY() AS INT);
				END
				ELSE
				BEGIN
					UPDATE	[DOC].[FilesDocumentHDR]
					SET		[TITLE]			= @TITLE
						,	[LABEL_ID]		= @LABEL_ID
						,	[UPDATED_DATE]	= GETDATE()
						,	[UPDATED_BY]	= @USER
					WHERE	[ID] = @FILE_ID
				END

			COMMIT TRANSACTION;
		END TRY
		BEGIN CATCH
			IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;

			THROW;
		END CATCH

		/*THE CALLER READS THIS BACK WITH ExecuteScalar TO LEARN THE NEW IDENTITY*/
		SELECT @FILE_ID AS [ID];
	END
END
