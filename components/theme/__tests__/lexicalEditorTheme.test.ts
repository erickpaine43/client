import theme from '../lexicalEditorTheme';

describe('lexicalEditorTheme', () => {
  it('exports a theme object', () => {
    expect(theme).toBeDefined();
    expect(typeof theme).toBe('object');
  });

  it('has paragraph styling', () => {
    expect(theme.paragraph).toBeDefined();
  });

  it('has text formatting styles', () => {
    expect(theme.text).toBeDefined();
    expect(theme.text.bold).toBeDefined();
    expect(theme.text.italic).toBeDefined();
    expect(theme.text.underline).toBeDefined();
  });

  it('has heading styles', () => {
    expect(theme.heading).toBeDefined();
    expect(theme.heading.h1).toBeDefined();
    expect(theme.heading.h2).toBeDefined();
  });

  it('has list styles', () => {
    expect(theme.list).toBeDefined();
    expect(theme.list.ul).toBeDefined();
    expect(theme.list.ol).toBeDefined();
  });

  it('all style values are strings', () => {
    const checkStringValues = (obj: any): boolean => {
      return Object.values(obj).every(val => 
        typeof val === 'string' || (typeof val === 'object' && checkStringValues(val))
      );
    };

    expect(checkStringValues(theme)).toBe(true);
  });
});
