/*Memberonboard table*/
CREATE DATABASE memberonboard;
CREATE SCHEMA "TPPL";
CREATE TABLE "TPPL"."TPPL_members" (
    member_id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    aadhar_number VARCHAR(20) NOT NULL,
    pan_number VARCHAR(20) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    bank_account VARCHAR(30) NOT NULL,
    bank_branch VARCHAR(100) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    date_of_joining DATE NOT NULL,
    email VARCHAR(100) NOT NULL
);
CREATE TABLE "TPPL"."TPPL_member_certificates" (
    certificate_id SERIAL PRIMARY KEY,
    member_id VARCHAR(10) NOT NULL,
    certificate_name VARCHAR(100) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES "TPPL"."TPPL_members"(member_id) ON DELETE CASCADE
);



ALTER TABLE "TPPL"."TPPL_members"
ADD CONSTRAINT valid_email_format CHECK (
  email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
);



ALTER TABLE "TPPL"."TPPL_members"
ADD CONSTRAINT aadhar_number_12_digits CHECK (
    aadhar_number ~ '^[0-9]{12}$'
);
ALTER TABLE "TPPL"."TPPL_members"
ALTER COLUMN pan_number TYPE VARCHAR(10);

ALTER TABLE "TPPL"."TPPL_members"
ADD CONSTRAINT pan_number_10_alphanumeric CHECK (
    pan_number ~ '^[A-Za-z0-9]{10}$'
);
ALTER TABLE "TPPL"."TPPL_members"
ADD CONSTRAINT bank_name_alpha CHECK (
    bank_name ~ '^[A-Za-z ]{1,50}$'
);
ALTER TABLE "TPPL"."TPPL_members"
ADD CONSTRAINT bank_account_numeric_25 CHECK (
    bank_account ~ '^[0-9]{1,25}$'
);
ALTER TABLE "TPPL"."TPPL_members"
ADD CONSTRAINT bank_branch_alpha_25 CHECK (
    bank_branch ~ '^[A-Za-z]{1,25}$'
);
ALTER TABLE "TPPL"."TPPL_members"
ADD CONSTRAINT ifsc_code_alphanumeric_20
CHECK (ifsc_code ~ '^[A-Za-z0-9]{1,20}$');

ALTER TABLE "TPPL"."TPPL_members"
ADD CONSTRAINT age_range CHECK (age >= 21 AND age <= 60);
