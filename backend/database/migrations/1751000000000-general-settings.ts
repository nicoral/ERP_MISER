import { MigrationInterface, QueryRunner } from "typeorm";

export class GeneralSettings1751000000000 implements MigrationInterface {
    name = 'GeneralSettings1751000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "general_settings" (
                "id" SERIAL NOT NULL,
                "company_name" character varying(255) NOT NULL DEFAULT 'MYSER ERP',
                "company_logo_url" character varying(500),
                "exchange_rate_sale" decimal(10,4),
                "exchange_rate_purchase" decimal(10,4),
                "exchange_rate_date" date,
                "exchange_rate_date_string" character varying(20),
                "exchange_rate_auto_update" boolean NOT NULL DEFAULT true,
                "timezone" character varying(100) NOT NULL DEFAULT 'America/Lima',
                "additional_settings" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_general_settings" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "general_settings"`);
    }
} 