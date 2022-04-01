<template>
  <div id="test">
    <div>
      <v-sheet tile height="100" class="d-flex" >
        <v-btn icon class="ma-2" @click="$refs.calendar.prev()" >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-select v-model="type" :items="types" dense outlined hide-details class="ma-2" label="type" ></v-select>
        <v-select v-model="mode" :items="modes" dense outlined hide-details label="event-overlap-mode" class="ma-2" ></v-select>
        <v-select v-model="weekday" :items="weekdays" dense outlined hide-details label="weekdays" class="ma-2" ></v-select>
        <v-spacer></v-spacer>
        <v-btn icon class="ma-2" @click="$refs.calendar.next()" >
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </v-sheet>
      <v-sheet >
        <v-calendar ref="calendar" v-model="value" :weekdays="weekday" :type="type" :events="events" :event-overlap-mode="mode" :event-overlap-threshold="60" @change="getEvents" ></v-calendar>
      </v-sheet>
    </div>
  </div>
</template>

<script>

export default {
  name: 'test',
  data() {
    return {
      type: 'day',
      types: ['month', 'week', 'day', '4day'],
      mode: 'stack',
      modes: ['stack', 'column'],
      weekday: [0, 1, 2, 3, 4, 5, 6],
      weekdays: [
        {text: 'Sun - Sat', value: [0, 1, 2, 3, 4, 5, 6]},
        {text: 'Mon - Sun', value: [1, 2, 3, 4, 5, 6, 0]},
        {text: 'Mon - Fri', value: [1, 2, 3, 4, 5]},
        {text: 'Mon, Wed, Fri', value: [1, 3, 5]},
      ],
      value: '',
      events: [],
    }
  },
  created() {

  },
  computed: {},
  watch: {},
  methods: {
    getEvents({start, end}) {

      this.events = [
        {
          name: '测试的',
          start:  new Date('2022-01-30 8:00:00'),
          end:  new Date('2022-01-30 9:30:00'),
          color: 'success',
          timed: true,
        },
        {
          name: '测试的2',
          start:  new Date('2022-01-30 8:10:00'),
          end:  new Date('2022-01-30 10:30:00'),
          color: 'success',
          timed: true,
        },
      ]

      console.log(start, end)
      console.log(this.value)

    },
    rnd(a, b) {
      console.log(Math.floor((b - a + 1) * Math.random()) + a)
      return Math.floor((b - a + 1) * Math.random()) + a
    },
  },
}
</script>

<style lang="scss">
#test {

}
</style>
