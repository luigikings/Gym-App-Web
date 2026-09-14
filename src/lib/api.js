import { supabase, PHOTOS_BUCKET } from './supabaseClient'

const MAX_HISTORY = 30

// -----------------------------------------------------------------
// Utilidades
// -----------------------------------------------------------------

/** Sube una foto al bucket "photos" y devuelve el path guardado en DB. */
export async function uploadPhoto(file, folder) {
  if (!file) return null
  const ext = file.name.split('.').pop()
  const path = `${folder}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  return path
}

// -----------------------------------------------------------------
// USERS
// -----------------------------------------------------------------

export async function listUsers() {
  const { data, error } = await supabase.from('users').select('*').order('created_at')
  if (error) throw error
  return data
}

/** Devuelve el usuario si la clave coincide, si no null. */
export async function verifyUserClave(userId, clave) {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single()
  if (error) throw error
  if (data && data.clave === clave) return data
  return null
}

export async function createUser({ name, clave, isAdmin = false }) {
  const { data, error } = await supabase
    .from('users')
    .insert({ name, clave, is_admin: isAdmin })
    .select()
    .single()
  if (error) throw error
  return data
}

// -----------------------------------------------------------------
// EXERCISES
// -----------------------------------------------------------------

export async function listExercises(userId) {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('user_id', userId)
    .order('created_at')
  if (error) throw error
  return data
}

export async function createExercise({ userId, name, photoFile }) {
  const photo_url = photoFile ? await uploadPhoto(photoFile, 'exercises') : null
  const { data, error } = await supabase
    .from('exercises')
    .insert({ user_id: userId, name, photo_url })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteExercise(exerciseId) {
  const { error } = await supabase.from('exercises').delete().eq('id', exerciseId)
  if (error) throw error
}

// -----------------------------------------------------------------
// ROUTINES
// -----------------------------------------------------------------

/** Lista rutinas del usuario con sus ejercicios (ya ordenados). */
export async function listRoutines(userId) {
  const { data, error } = await supabase
    .from('routines')
    .select('*, routine_exercises(id, order, exercise:exercises(*))')
    .eq('user_id', userId)
    .order('created_at')
  if (error) throw error
  return data.map((r) => ({
    ...r,
    exercises: (r.routine_exercises ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((re) => ({ ...re.exercise, routine_exercise_id: re.id })),
  }))
}

export async function getRoutine(routineId) {
  const { data, error } = await supabase
    .from('routines')
    .select('*, routine_exercises(id, order, exercise:exercises(*))')
    .eq('id', routineId)
    .single()
  if (error) throw error
  return {
    ...data,
    exercises: (data.routine_exercises ?? [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((re) => ({ ...re.exercise, routine_exercise_id: re.id })),
  }
}

export async function createRoutine({ userId, name, photoFile }) {
  const photo_url = photoFile ? await uploadPhoto(photoFile, 'routines') : null
  const { data, error } = await supabase
    .from('routines')
    .insert({ user_id: userId, name, photo_url })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRoutine(routineId) {
  const { error } = await supabase.from('routines').delete().eq('id', routineId)
  if (error) throw error
}

export async function addExerciseToRoutine(routineId, exerciseId, order) {
  const { error } = await supabase
    .from('routine_exercises')
    .insert({ routine_id: routineId, exercise_id: exerciseId, order })
  if (error) throw error
}

export async function removeExerciseFromRoutine(routineExerciseId) {
  const { error } = await supabase.from('routine_exercises').delete().eq('id', routineExerciseId)
  if (error) throw error
}

// -----------------------------------------------------------------
// ACTIVE SESSION (entrenamiento en curso)
// -----------------------------------------------------------------

export async function getActiveSession(userId) {
  const { data, error } = await supabase
    .from('active_session')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function startActiveSession({ userId, routineId, routineName }) {
  const { data, error } = await supabase
    .from('active_session')
    .upsert(
      {
        user_id: userId,
        routine_id: routineId,
        routine_name: routineName,
        started_at: new Date().toISOString(),
        elapsed_seconds: 0,
        sets_data: {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select()
    .single()
  if (error) throw error
  return data
}

/** Guarda el progreso en vivo (se llama al marcar/editar una serie). */
export async function saveActiveSessionProgress(userId, { setsData, elapsedSeconds }) {
  const { error } = await supabase
    .from('active_session')
    .update({
      sets_data: setsData,
      elapsed_seconds: elapsedSeconds,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
  if (error) throw error
}

export async function deleteActiveSession(userId) {
  const { error } = await supabase.from('active_session').delete().eq('user_id', userId)
  if (error) throw error
}

// -----------------------------------------------------------------
// TERMINAR ENTRENAMIENTO -> guarda historial + actualiza récords
// -----------------------------------------------------------------

/**
 * exercisesWithSets: [{ id, name, sets: [{kg, reps}, ...] }]
 * Devuelve { brokenRecords: [{exerciseName, prev, next}] }
 */
export async function finishWorkout({
  userId,
  routineId,
  routineName,
  durationSeconds,
  exercisesWithSets,
}) {
  // 1. Crear la sesión de historial
  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: userId,
      routine_id: routineId,
      routine_name: routineName,
      date: new Date().toISOString(),
      duration_seconds: durationSeconds,
    })
    .select()
    .single()
  if (sessionError) throw sessionError

  // 2. Guardar todas las series
  const setRows = []
  exercisesWithSets.forEach((ex) => {
    ex.sets.forEach((set, idx) => {
      setRows.push({
        session_id: session.id,
        exercise_id: ex.id,
        exercise_name: ex.name,
        set_number: idx + 1,
        kg: Number(set.kg) || 0,
        reps: Number(set.reps) || 0,
      })
    })
  })
  if (setRows.length > 0) {
    const { error: setsError } = await supabase.from('workout_sets').insert(setRows)
    if (setsError) throw setsError
  }

  // 3. Revisar récords
  const { data: currentRecords, error: recordsError } = await supabase
    .from('records')
    .select('*')
    .eq('user_id', userId)
  if (recordsError) throw recordsError
  const recordsByExercise = new Map(currentRecords.map((r) => [r.exercise_id, r]))

  const brokenRecords = []
  for (const ex of exercisesWithSets) {
    // La mejor serie del ejercicio en este entrenamiento (mayor kg, y a igual kg, mayor reps)
    let best = null
    for (const set of ex.sets) {
      const kg = Number(set.kg) || 0
      const reps = Number(set.reps) || 0
      if (kg <= 0 || reps <= 0) continue
      if (!best || kg > best.kg || (kg === best.kg && reps > best.reps)) {
        best = { kg, reps }
      }
    }
    if (!best) continue

    const current = recordsByExercise.get(ex.id)
    const isNewRecord =
      !current || best.kg > current.kg || (best.kg === current.kg && best.reps > current.reps)

    if (isNewRecord) {
      const nowIso = new Date().toISOString()
      const payload = {
        user_id: userId,
        exercise_id: ex.id,
        kg: best.kg,
        reps: best.reps,
        date: nowIso,
        prev_kg: current?.kg ?? null,
        prev_reps: current?.reps ?? null,
        prev_date: current?.date ?? null,
      }
      const { error: upsertError } = await supabase
        .from('records')
        .upsert(payload, { onConflict: 'user_id,exercise_id' })
      if (upsertError) throw upsertError

      brokenRecords.push({
        exerciseId: ex.id,
        exerciseName: ex.name,
        prev: current ? { kg: current.kg, reps: current.reps, date: current.date } : null,
        next: { kg: best.kg, reps: best.reps, date: nowIso },
      })
    }
  }

  // 4. FIFO: máximo 30 entrenamientos en el historial
  const { data: allSessions, error: listError } = await supabase
    .from('workout_sessions')
    .select('id, date')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (listError) throw listError
  if (allSessions.length > MAX_HISTORY) {
    const toDelete = allSessions.slice(MAX_HISTORY).map((s) => s.id)
    const { error: delError } = await supabase.from('workout_sessions').delete().in('id', toDelete)
    if (delError) throw delError
  }

  // 5. Borrar la sesión activa
  await deleteActiveSession(userId)

  return { brokenRecords, session }
}

// -----------------------------------------------------------------
// HISTORIAL
// -----------------------------------------------------------------

export async function listHistory(userId) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*, workout_sets(*)')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(MAX_HISTORY)
  if (error) throw error
  return data.map((session) => ({
    ...session,
    exercises: groupSetsByExercise(session.workout_sets),
  }))
}

function groupSetsByExercise(sets) {
  const map = new Map()
  for (const set of sets ?? []) {
    if (!map.has(set.exercise_name)) map.set(set.exercise_name, [])
    map.get(set.exercise_name).push(set)
  }
  return Array.from(map.entries()).map(([name, sets]) => ({
    name,
    sets: sets.sort((a, b) => a.set_number - b.set_number),
  }))
}

// -----------------------------------------------------------------
// RECORDS
// -----------------------------------------------------------------

export async function listRecords(userId) {
  const { data, error } = await supabase
    .from('records')
    .select('*, exercise:exercises(id, name, photo_url)')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (error) throw error
  return data
}
