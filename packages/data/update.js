const { default: Axios } = require('axios')
const { Queue } = require('@kkdy/queue')

const ins = Axios.create({
  // baseURL: 'https://test.api.kokodayo.fun',
  timeout: 1000000,
  baseURL: 'http://127.0.0.1:7001',
})

;(async () => {
  // const { data } = await ins.get('/')
  // await updateBuildingBuff()
  // await updateBuildingSkill()
  // await updateCharInfo()
  // await updateCharword()
  // await updateSkill()
  // await updatePatchInfo()
  // await updateTeamInfo()
  // await updateChars()
  await updateAct()
  // const { data }
  // return
  const res = await ins.get('/data/acts', {
    id: 'char_1001_amiya2',
    // relativeId: 'char_1001_amiya2',
    comment: 'nb',
  })
  console.log(res.data)
  const { data } = await getChar('char_1001_amiya2')
  // const { data: skills } = await getSkill('skcom_atk_up[1]')
  console.log('data', data)
  // console.log('skill', skills)
})()

async function updateBuildingBuff() {
  const hook_book = require('./ArknightsGameData/zh_CN/gamedata/excel/building_data.json')
    .buffs

  const list = Object.values(hook_book)

  const queue = Queue.of(144)
  list.forEach((e, i) => {
    queue.pushTask(() =>
      ins.post('/update/buildingBuff', e).then(() => {
        console.log('buildingBuff', queue.total, queue.done)
      })
    )
  })

  await queue.allDone()
}

async function updateBuildingSkill() {
  const hook_book = require('./ArknightsGameData/zh_CN/gamedata/excel/building_data.json')
    .chars

  const list = Object.values(hook_book)

  const queue = Queue.of(144)
  list.forEach((e, i) => {
    queue.pushTask(() =>
      ins.post('/update/buildingSkill', e).then(() => {
        console.log('buildingSkill', queue.total, queue.done)
      })
    )
  })

  await queue.allDone()
}

function updateCharInfo() {
  const hook_book = require('./ArknightsGameData/zh_CN/gamedata/excel/handbook_info_table.json')
    .handbookDict

  const list = Object.values(hook_book)

  const queue = Queue.of(144)
  list.forEach((e) => {
    queue.pushTask(() =>
      ins.post('/update/charInfo', e).then(() => {
        console.log('charInfo', queue.total, queue.done)
      })
    )
  })

  return queue.allDone()
}

function updateSkill() {
  const skill_table = require('./ArknightsGameData/zh_CN/gamedata/excel/skill_table.json')
  const list = Object.values(skill_table)

  const queue = Queue.of(144)
  list.forEach((e) => {
    queue.pushTask(() =>
      ins.post('/update/skill', e).then(() => {
        console.log('skill', queue.total, queue.done)
      })
    )
  })
  return queue.allDone()
}

function updateCharword() {
  const charword_table = require('./ArknightsGameData/zh_CN/gamedata/excel/charword_table.json')
  const list = Object.values(charword_table)

  const queue = Queue.of(144)
  let errCount = 0
  list.forEach((e) => {
    queue.pushTask(() => {
      const task = () =>
        ins
          .post('/update/charword', e)
          .then(() => {
            console.log(
              'word',
              e.charWordId,
              queue.total,
              queue.done,
              queue.running
            )
          })
          .catch((err) => {
            console.error('err: ' + errCount++, e.charId, err.message)
            queue.pushTask(task)
          })
      return task()
    })
  })
  return queue.allDone()
}

function updateTeamInfo() {
  const team_table = require('./ArknightsGameData/zh_CN/gamedata/excel/handbook_team_table.json')
  const list = Object.values(team_table)

  const queue = Queue.of(512)
  list.forEach((e) => {
    queue.pushTask(() =>
      ins.post('/update/teamInfo', e).then(() => {
        console.log('teamInfo', queue.total, queue.done)
      })
    )
  })
  return queue.allDone()
}

function updateChars() {
  const character_table = require('./ArknightsGameData/zh_CN/gamedata/excel/character_table.json')
  const patchChars = require('./ArknightsGameData/zh_CN/gamedata/excel/char_patch_table.json')
    .patchChars
  const list = [
    ...Object.entries(character_table),
    ...Object.entries(patchChars),
  ] //.filter(([key]) => key === 'char_502_nblade')

  const queue = Queue.of(12)
  list.forEach(([id, data], i) => {
    // if (i > 0) return
    const t = () =>
      ins
        .post('/update/char', { id, data })
        .then(() => {
          console.log('char', queue.total, queue.done)
        })
        .catch((err) => {
          console.log('err', id, err)
          queue.pushTask(t)
        })

    queue.pushTask(t)
  })

  return queue.allDone()
}

function getCharRaw(charId) {
  return ins.get('/update/char', { params: { id: charId } })
}

function getChar(charId) {
  return ins.post('/update/saveChar', { charId })
}

function updatePatchInfo() {
  return new Promise((resolve) => {
    const patchInfos = require('./ArknightsGameData/zh_CN/gamedata/excel/char_patch_table.json')
      .patchDetailInfoList
    const list = Object.entries(patchInfos)

    const queue = Queue.of(512, { finalTask: resolve })
    list.forEach(([charId, data], i) => {
      queue.pushTask(() => ins.post('/update/patchInfo', { charId, data }))
    })
  })
}

function getSkill(skillId) {
  return ins.get('/s/skill', { params: { skillId } })
}

async function updateAct() {
  const acts = require('./ArknightsGameData/zh_CN/gamedata/excel/activity_table.json')
    .basicInfo
  const q = Queue.of(12)
  Object.values(acts).forEach((data) => {
    q.pushTask(() => ins.post('/update/activity', data))
  })
  await q.allDone()
}
