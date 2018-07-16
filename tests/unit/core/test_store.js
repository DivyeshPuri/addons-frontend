import { middleware } from 'core/store';
import { getFakeConfig } from 'tests/unit/helpers';

describe(__filename, () => {
  const configForDev = (isDevelopment, config = {}) => {
    return getFakeConfig({
      isDevelopment,
      server: false,
      ...config,
    });
  };

  it('includes the middleware in development', () => {
    const _createLogger = sinon.stub();
    expect(
      typeof middleware({
        _config: configForDev(true),
        _createLogger,
      }),
    ).toBe('function');
    sinon.assert.called(_createLogger);
  });

  it('does not apply middleware if not in development', () => {
    const _createLogger = sinon.stub();
    expect(
      typeof middleware({
        _config: configForDev(false),
        _createLogger,
      }),
    ).toBe('function');
    sinon.assert.notCalled(_createLogger);
  });

  it('handles a falsey window while on the server', () => {
    const _createLogger = sinon.stub();
    const _window = null;
    expect(
      typeof middleware({
        _config: configForDev(true),
        _createLogger,
        _window,
      }),
    ).toBe('function');
    sinon.assert.called(_createLogger);
  });

  it('does not create a logger for the server', () => {
    const _createLogger = sinon.stub();
    expect(
      typeof middleware({
        _config: configForDev(true, { server: true }),
        _createLogger,
      }),
    ).toBe('function');
    sinon.assert.notCalled(_createLogger);
  });

  it('uses a placeholder store enhancer when devtools is not available', () => {
    const _window = {}; // __REDUX_DEVTOOLS_EXTENSION__() is undefined
    const _config = getFakeConfig({ enableDevTools: true });

    const enhancer = middleware({ _config, _window });

    expect(typeof enhancer).toBe('function');

    const createStore = () => {};
    expect(typeof enhancer(createStore)).toBe('function');
  });

  it('adds the devtools store enhancer when config enables it', () => {
    const _window = {
      __REDUX_DEVTOOLS_EXTENSION__: sinon.spy(),
    };
    const _config = getFakeConfig({ enableDevTools: true });

    expect(typeof middleware({ _config, _window })).toBe('function');
    sinon.assert.called(_window.__REDUX_DEVTOOLS_EXTENSION__);
  });

  it('does not add the devtools store enhancer when config disables it', () => {
    const _window = {
      __REDUX_DEVTOOLS_EXTENSION__: sinon.spy(),
    };
    const _config = getFakeConfig({ enableDevTools: false });

    expect(typeof middleware({ _config, _window })).toBe('function');
    sinon.assert.notCalled(_window.__REDUX_DEVTOOLS_EXTENSION__);
  });
});
