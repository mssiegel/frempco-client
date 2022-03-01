import Head from 'next/head';
import { Button, Typography } from '@mui/material';
import { getAllClassroomNames, ClassroomProps } from '@utils/classrooms';
import Layout from '@components/shared/Layout';
import StudentsPage from '@components/pages/StudentsPage';
import BasicModal from '@components/shared/Modal';
import ModalTextField from '@components/shared/ModalTextField';
import { useRef, useState, useContext, useEffect } from 'react';
import { getClassroom } from '@utils/classrooms';
import { SocketContext } from '@contexts/SocketContext';
import { useRouter } from 'next/router';

export async function getStaticPaths() {
  const paths = getAllClassroomNames();
  paths.push({ params: { classroomName: 'setupClassroom' } });
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  return {
    props: {
      classroomName: params.classroomName,
    },
  };
}

export default function StudentPage({ classroomName }: ClassroomProps) {
  const apiUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1`;
  const router = useRouter();
  const classStudentInput = useRef<HTMLInputElement>(null);
  const studentNameInput = useRef<HTMLInputElement>(null);
  const [studentName, setStudentName] = useState('');
  const [openStudentModal, setOpenStudentModal] = useState(false);
  const handleCloseStudentModal = () => setOpenStudentModal(false);
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (!studentName && classroomName === 'setupClassroom') {
      setOpenStudentModal(true);
    }
    if (studentName && classroomName !== 'setupClassroom') {
      socket.emit('new student entered', {
        classroom: classroomName,
        student: studentName,
      });
      setOpenStudentModal(false);
    }
  }, [classroomName, studentName]);

  async function visitStudentsPage() {
    const classroom = classStudentInput.current.value;
    const classroomObj = getClassroom(classroom);
    if (!classroomObj) return window.alert(`Invalid classroom: ${classroom}`);
    const getResponse = await fetch(`${apiUrl}/classrooms/${classroom}`);
    const { isActive } = await getResponse.json();
    if (!isActive)
      return window.alert(
        `Classroom not activated: ${classroom}\n Please wait for your teacher to activate your classroom and try again.`,
      );
    const student = studentNameInput.current.value;
    if (student?.trim()) {
      router.push(`/student/classroom/${classroom}`);
      setOpenStudentModal(false);
      setStudentName(student);
    }
  }

  return (
    <Layout>
      <Head>
        <title>Frempco - Student page</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <BasicModal open={openStudentModal}>
        <Typography variant='h5'>Hello student</Typography>

        <ModalTextField
          label='Classroom'
          refObject={classStudentInput}
          autoFocus={true}
        />
        <ModalTextField label='Your Name' refObject={studentNameInput} />

        <Button variant='contained' size='large' onClick={visitStudentsPage}>
          Visit Student&apos;s Room
        </Button>
      </BasicModal>

      {!openStudentModal && classroomName !== 'setupClassroom' && (
        <StudentsPage classroomName={classroomName} student={studentName} />
      )}
    </Layout>
  );
}
