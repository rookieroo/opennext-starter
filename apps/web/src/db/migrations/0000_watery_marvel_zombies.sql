CREATE TABLE `notion_connections` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`userId` text NOT NULL,
	`notionWorkspaceId` text(255) NOT NULL,
	`notionAccessToken` text(255) NOT NULL,
	`botId` text(255) NOT NULL,
	`workspaceName` text(255),
	`workspaceIcon` text(255),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notion_connections_notionWorkspaceId_unique` ON `notion_connections` (`notionWorkspaceId`);--> statement-breakpoint
CREATE INDEX `connection_user_id_idx` ON `notion_connections` (`userId`);--> statement-breakpoint
CREATE INDEX `notion_workspace_id_idx` ON `notion_connections` (`notionWorkspaceId`);--> statement-breakpoint
CREATE TABLE `passkey_credential` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`userId` text NOT NULL,
	`credentialId` text(255) NOT NULL,
	`credentialPublicKey` text(255) NOT NULL,
	`counter` integer NOT NULL,
	`transports` text(255),
	`aaguid` text(255),
	`userAgent` text(255),
	`ipAddress` text(100),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `passkey_credential_credentialId_unique` ON `passkey_credential` (`credentialId`);--> statement-breakpoint
CREATE INDEX `passkey_user_id_idx` ON `passkey_credential` (`userId`);--> statement-breakpoint
CREATE INDEX `credential_id_idx` ON `passkey_credential` (`credentialId`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`firstName` text(255),
	`lastName` text(255),
	`segmentName` text(255),
	`email` text(255),
	`passwordHash` text,
	`role` text DEFAULT 'user' NOT NULL,
	`emailVerified` integer,
	`signUpIpAddress` text(100),
	`googleAccountId` text(255),
	`notionAccountId` text(255),
	`avatar` text(600)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `google_account_id_idx` ON `user` (`googleAccountId`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `user` (`role`);