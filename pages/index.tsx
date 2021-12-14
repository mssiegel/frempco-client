import { Box, Button, Typography } from '@mui/material';
import {
  School as SchoolIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import { useRouter } from 'next/router';

import Link from '@utilComponents/Link';
import Layout from '@components/Layout';
import { getClassroom, sampleClassroomName } from '@utils/classrooms';

export default function Home() {
  const router = useRouter();
  const apiUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1`;

  async function visitStudentsPage() {
    const classroom = window.prompt('What classroom are you visiting?');
    const classroomObj = getClassroom(classroom);
    if (!classroomObj) return window.alert(`Invalid classroom: ${classroom}`);

    const getResponse = await fetch(`${apiUrl}/classrooms/${classroom}`);
    const { isActive } = await getResponse.json();
    if (!isActive)
      return window.alert(
        `Classroom not activated: ${classroom}\n Please wait for your teacher to activate your classroom and try again.`,
      );

    const studentName = window.prompt('Classroom found! What is your name?');
    // TODO: send socket request to notify the teacher

    // Visit students page
    router.push(`/student/classroom/${classroom}`);
  }

  function visitTeachersPage() {
    const classroom = window.prompt('What classroom are you visiting?');
    const classroomObj = getClassroom(classroom);
    if (!classroomObj) return window.alert(`Invalid classroom: ${classroom}`);

    const password = window.prompt(`What is the password for ${classroom}?`);
    if (String(classroomObj.password) !== password)
      return window.alert(`IncorrectPassword: ${password}`);

    // Visit teachers page
    router.push(`/teacher/classroom/${classroom}`);
  }

  return (
    <Layout>
      <Head>
        <title>Frempco</title>
        <meta
          name='description'
          content='Frempco lets teachers pair up classmates for text-based improvised chats. Students build up real-world friendships through collaboration and storytelling.'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <Typography
          variant='h1'
          sx={{ color: (theme) => theme.palette.common.white }}
        >
          Welcome to Frempco!
        </Typography>
        <Box sx={{ m: 5 }}>
          <Typography variant='h3' sx={{ color: 'white', mb: 1 }}>
            For Students:
          </Typography>
          <Button
            variant='contained'
            size='large'
            startIcon={<LightbulbIcon />}
            onClick={visitStudentsPage}
          >
            Students page
          </Button>

          <Typography variant='h3' sx={{ color: 'white', mb: 1, mt: 8 }}>
            For Teachers:
          </Typography>
          <Button
            variant='contained'
            size='large'
            startIcon={<SchoolIcon />}
            onClick={visitTeachersPage}
          >
            Teachers page
          </Button>

          <Typography variant='h5' sx={{ m: 5, mt: 10, color: 'gray' }}>
            Below link shortcuts are for development purposes only and will be
            deleted prior to making this website live and ready for teachers
          </Typography>
          <Typography variant='h5' sx={{ m: 5 }}>
            <Link href={`/teacher/classroom/${sampleClassroomName}`}>
              Visit Teachers admin page
            </Link>
          </Typography>
          <Typography variant='h5' sx={{ m: 5 }}>
            <Link href={`/student/classroom/${sampleClassroomName}`}>
              Visit Students classroom page
            </Link>
          </Typography>
        </Box>
      </main>
    </Layout>
  );
}
