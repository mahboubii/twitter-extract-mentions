import { expect } from 'chai';
import extractMentions from '../src';

describe('basic tests', () => {
  it('should extract mentions with default usernameLength', () => {
    expect(extractMentions('@mention')).to.be.deep.equal(['mention']);
    expect(extractMentions('@mention_score')).to.be.deep.equal(['mention_score']);
    expect(extractMentions('@123mention')).to.be.deep.equal(['123mention']);
    expect(extractMentions('@123_mention')).to.be.deep.equal(['123_mention']);
    expect(extractMentions('@mention_123')).to.be.deep.equal(['mention_123']);
    expect(extractMentions('@ververyverlonglonglonglongusername')).to.be.deep.equal([
      'ververyverlonglonglonglonguser',
    ]);

    expect(
      extractMentions('hey @mention word @ververyverlonglonglonglongusername'),
    ).to.be.deep.equal(['mention', 'ververyverlonglonglonglonguser']);
  });

  it('should extract mentions with usernameLength', () => {
    expect(extractMentions('@ververyverlonglonglonglongusername', 40)).to.be.deep.equal([
      'ververyverlonglonglonglongusername',
    ]);

    expect(
      extractMentions('hey @mention word @ververyverlonglonglonglongusername', 40),
    ).to.be.deep.equal(['mention', 'ververyverlonglonglonglongusername']);
  });
});
