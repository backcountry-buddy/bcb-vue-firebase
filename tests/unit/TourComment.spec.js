import { shallowMount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import TourComment from '@/components/TourComment.vue';

const localVue = createLocalVue();
localVue.use(VueRouter);
const router = new VueRouter();

describe('TourComment.vue', () => {
  it('renders props.comment when passed', () => {
    const comment = {
      body: 'a test comment',
      authorRef: {
        id: '1',
        displayName: 'test author'
      }
    };
    const wrapper = shallowMount(TourComment, {
      localVue,
      router,
      propsData: { comment }
    });
    expect(wrapper.text()).toMatch(comment.body);
    expect(wrapper.text()).toMatch(comment.authorRef.displayName);
  });
});
