import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1749785395400 implements MigrationInterface {
    name = 'Migrations1749785395400'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "brand" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "imageUrl" character varying(255) NOT NULL, CONSTRAINT "PK_a5d20765ddd942eb5de4eee2d7f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "article" ADD "brandId" integer`);
        await queryRunner.query(`ALTER TABLE "article" ADD CONSTRAINT "FK_103b3dd4b5c0ca304eac2b8b035" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" DROP CONSTRAINT "FK_103b3dd4b5c0ca304eac2b8b035"`);
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "brandId"`);
        await queryRunner.query(`DROP TABLE "brand"`);
    }

}
