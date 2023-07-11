import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useCallback, useState } from "react";

import { gql, useLazyQuery, useMutation } from "@apollo/client";
import client from "../apollo-client";

//https://www.apollographql.com/docs/react/data/mutations
const HELLO_QUERY = {
  query: gql`
    query {
      hello
    }
  `,
};
const ALL_STUDENTS = {
  query: gql`
    query {
      students {
        id
        firstName
        lastName
        age
      }
    }
  `,
};
const STUDENT_BY_ID = gql`
  query STUDENT_BY_ID($studentID: String!) {
    student(id: $studentID) {
      firstName
    }
  }
`;

const CREATE_STUDENT = gql`
  mutation CREATE_STUDENT($fname: String!, $lname: String!, $age: Int!) {
    create(firstName: $fname, lastName: $lname, age: $age) {
      id
    }
  }
`;

type StudentType = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
};

export default function Home() {
  const [students, setStudents] = useState([] as StudentType[]);
  const [studentID, setStudentID] = useState("");
  const [getStudent, { loading, error, data }] = useLazyQuery(STUDENT_BY_ID);
  const [createStudent, {}] = useMutation(CREATE_STUDENT);

  const handleGetStudents = async () => {
    client
      .query(ALL_STUDENTS)
      .then((result) => {
        const { data } = result;
        if (!data) {
          return;
        }
        setStudents(data.students);
      })
      .catch((err) => console.log(err));
    // const { data } = await client.query(ALL_STUDENTS);
    // console.log(data);
  };

  const handleGetStudentById = useCallback(
    async (e) => {
      console.log(studentID);
      getStudent({ variables: { studentID: studentID.trim() } })
        .then((result) => {
          console.log(result);
          const { data } = result;
          if (!data) {
            return;
          }
          // setStudents(data.students);
        })
        .catch((err) => console.log(err));
      // const { data } = await client.query(ALL_STUDENTS);
      // console.log(data);
    },
    [studentID]
  );

  const handleCreateStudent = (e) => {
    e.preventDefault();
    const fname = e.target.fname.value;
    const lname = e.target.lname.value;
    const age = parseInt(e.target.age.value) ?? 0;
    console.log({ fname, lname, age });
    // client
    //   .query({
    //     query: gql`
    //       mutation {
    //         create(firstName: "qq", lastName: "ww", age: ee) {
    //           id
    //         }
    //       }
    //     `,
    //   })
    //   .then((result) => {
    //     console.log(result);
    //   })
    //   .catch((err) => console.log(err));
    createStudent({ variables: { fname, lname, age } })
      .then((result) => {
        console.log(result);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div style={{ height: "100vh" }}>
      <h1 style={{ height: 40 }}>GraphQL Study</h1>
      <div
        style={{
          display: "flex",
          height: "calc(100% - 40px)",
          boxSizing: "border-box",
          padding: 20,
        }}
      >
        <div style={{ flex: "1", borderRight: "1px solid black" }}>
          <button onClick={handleGetStudents}>Request Students</button>
          {students.length > 0 && (
            <ol>
              {students.map((student: StudentType) => (
                <li key={student.id}>
                  id:{student.id} FirstName : {student.firstName} LastName :{" "}
                  {student.lastName} Age : {student.age}
                </li>
              ))}
            </ol>
          )}
          <div>
            <button onClick={handleGetStudentById}>Get Student of ID : </button>
            <br></br>
            <textarea
              value={studentID}
              onChange={(e) => setStudentID(e.target.value)}
            ></textarea>
          </div>
        </div>
        <div style={{ flex: "1", boxSizing: "border-box", padding: 20 }}>
          <div>
            <div>Create student</div>
            <form
              style={{ display: "flex", flexDirection: "column" }}
              onSubmit={handleCreateStudent}
            >
              <label>First name</label>
              <input type="text" id="fname" name="fname"></input>
              <label>Last name</label>
              <input type="text" id="lname" name="lname"></input>
              <label>Age</label>
              <input type="number" id="age" name="age"></input>
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
