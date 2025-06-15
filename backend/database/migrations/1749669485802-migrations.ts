import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1749669485802 implements MigrationInterface {
    name = 'Migrations1749669485802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "audit_log" ("id" SERIAL NOT NULL, "action" character varying NOT NULL, "entity" character varying(100), "entity_id" character varying(100), "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "ip_address" character varying(100), "old_value" jsonb, "new_value" jsonb, "details" character varying(100), "employeeId" integer, CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "audit_log" ADD CONSTRAINT "FK_4a73006d917600795bc07bb4497" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_log" DROP CONSTRAINT "FK_4a73006d917600795bc07bb4497"`);
        await queryRunner.query(`DROP TABLE "audit_log"`);
    }

}
