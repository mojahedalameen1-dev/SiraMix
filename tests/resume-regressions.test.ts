import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_RESUME_DATA } from '../constants';
import { sectionCompletion } from '../components/ResumeForm';

const freshData = () => structuredClone(DEFAULT_RESUME_DATA);

test('empty placeholder entries do not count as completed sections', () => {
  const data = freshData();
  data.experience.push({
    id: 'empty-experience',
    company: '',
    title: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  data.education.push({
    id: 'empty-education',
    institution: '',
    degree: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  data.skills.push({ id: 'empty-skill', name: '   ' });

  assert.equal(sectionCompletion('experience', data), 0);
  assert.equal(sectionCompletion('education', data), 0);
  assert.equal(sectionCompletion('skills', data), 0);
});

test('meaningful experience and education entries count toward completion', () => {
  const data = freshData();
  data.experience.push({
    id: 'experience',
    company: 'SiraMix',
    title: 'Product Designer',
    startDate: '',
    endDate: '',
    description: '',
  });
  data.education.push({
    id: 'education',
    institution: 'University',
    degree: 'BSc',
    startDate: '',
    endDate: '',
    description: '',
  });

  assert.equal(sectionCompletion('experience', data), 50);
  assert.equal(sectionCompletion('education', data), 100);
});

test('empty custom section rows do not report complete', () => {
  const data = freshData();
  data.customSectionsData.custom_test = [{
    id: 'empty-custom',
    primaryText: '',
    secondaryText: '',
    startDate: '',
    endDate: '',
    description: '',
  }];

  assert.equal(sectionCompletion('custom_test', data), 0);
  data.customSectionsData.custom_test[0].primaryText = 'AWS certification';
  assert.equal(sectionCompletion('custom_test', data), 100);
});
