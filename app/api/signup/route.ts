import { sql } from "@/db";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const json = await request.json();

  const res = await sql(
    "select id, username from users where username ilike $1",
    [json.username]
  );

  // Check if res is not null and res.rowCount is not undefined
  if (res !== null && res.rowCount !== undefined) {
    if (res.rowCount > 0) {
      return NextResponse.json({ error: "user already exists" }, { status: 400 });
    }
  } else {
    // Handle the case where res or res.rowCount is null or undefined
    console.error("Error: Database response or rowCount is null or undefined");
    // Add appropriate error handling or return a response indicating an error
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  const saltRounds = 10;
  const hash = await bcrypt.hash(json.password, saltRounds);

  await sql("insert into users (username, password) values ($1, $2)", [
    json.username,
    hash,
  ]);

  return NextResponse.json({ msg: "registration success" }, { status: 201 });
}
