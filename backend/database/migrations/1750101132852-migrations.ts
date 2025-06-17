import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1750101132852 implements MigrationInterface {
    name = 'Migrations1750101132852'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "requirement_article" ("id" SERIAL NOT NULL, "quantity" numeric NOT NULL, "unit_price" numeric(10,2) NOT NULL, "justification" text, "requirementId" integer, "articleId" integer, CONSTRAINT "PK_ffd250fb8f9c73fc78d1f249df9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "requirement" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "priority" character varying NOT NULL, "observation" text, "status" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "employeeId" integer, "costCenterId" integer, CONSTRAINT "UQ_0dc5c1975be30b693c656579bc9" UNIQUE ("code"), CONSTRAINT "PK_5e3278ee8e2094dd0f10a4aec62" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "requirement_article" ADD CONSTRAINT "FK_600e07663b4b091ce5fb5ea3fe5" FOREIGN KEY ("requirementId") REFERENCES "requirement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requirement_article" ADD CONSTRAINT "FK_ca9dcbf4e6e201c288edef2b3f7" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD CONSTRAINT "FK_128830cf7c05d14db5d619c7302" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requirement" ADD CONSTRAINT "FK_4f4ce1d2fed2c69f2c5724b642b" FOREIGN KEY ("costCenterId") REFERENCES "cost_center"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requirement" DROP CONSTRAINT "FK_4f4ce1d2fed2c69f2c5724b642b"`);
        await queryRunner.query(`ALTER TABLE "requirement" DROP CONSTRAINT "FK_128830cf7c05d14db5d619c7302"`);
        await queryRunner.query(`ALTER TABLE "requirement_article" DROP CONSTRAINT "FK_ca9dcbf4e6e201c288edef2b3f7"`);
        await queryRunner.query(`ALTER TABLE "requirement_article" DROP CONSTRAINT "FK_600e07663b4b091ce5fb5ea3fe5"`);
        await queryRunner.query(`DROP TABLE "requirement"`);
        await queryRunner.query(`DROP TABLE "requirement_article"`);
    }

}
