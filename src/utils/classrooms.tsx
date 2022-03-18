import Filter from 'bad-words';

import classrooms from 'data/classrooms.json';

export function getAllClassroomNames() {
  return classrooms.map(({ classroomName }) => ({
    params: {
      classroomName,
    },
  }));
}

// we need this function because crypto.randomUUID is not supported
// in all devices and browsers yet. https://stackoverflow.com/a/8809472
function generateUUID() {
  // Public Domain/MIT
  var d = new Date().getTime(); //Timestamp
  var d2 =
    (typeof performance !== 'undefined' &&
      performance.now &&
      performance.now() * 1000) ||
    0; //Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function getUniqueID() {
  if (typeof window === 'undefined') return;
  const localUUID = sessionStorage.getItem('frempco_uuid');
  if (localUUID) return localUUID;
  const newLocalUUID = generateUUID();
  sessionStorage.setItem('frempco_uuid', newLocalUUID);
  return newLocalUUID;
}

export function getClassroom(classroom: string) {
  return classrooms.find(({ classroomName }) => classroomName === classroom);
}

export function getRandom<T>(arr: Array<T>): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function swap<T>(arr: Array<T>, i1: number, i2: number) {
  const temp = arr[i2];
  arr[i2] = arr[i1];
  arr[i1] = temp;
}

export function currentTime() {
  return new Date().toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  });
}

export function filterWords(words: string) {
  const filter = new Filter();
  try {
    return filter.clean(words);
    // the filter throws an error if the string only has non-letter characters
  } catch (e) {
    return words;
  }
}

export function scrollDown(refObject) {
  if (refObject.current)
    refObject.current.scrollIntoView({ behavior: 'smooth' });
}

export const sampleClassroomName = classrooms[0].classroomName;

export interface ClassroomProps {
  classroomName: string;
}

export interface Student {
  socketId: string;
  realName: string;
  character?: string;
}
