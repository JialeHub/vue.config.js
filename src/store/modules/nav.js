const type = {
  SET_NAV: 'SET_NAV'
};

const state = {
  nav: '/'
};

const getters = {
  nav: state => state.nav
};

const mutations = {
  [type.SET_NAV](state, nav) {
    if (nav) state.nav = nav;
    else state.nav = {}
  }
};

const actions = {
  setNav: ({commit}, nav) => {
    commit(type.SET_NAV, nav)
  }
};

export default {
  state,
  getters,
  mutations,
  actions
}
