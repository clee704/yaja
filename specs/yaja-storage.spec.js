describe('yaja.Stack', function () {

  describe('duplicate method', function () {
    it('should work when there is one element', function () {
      var stack = new yaja.Stack();
      stack.push(42);
      stack.duplicate();
      stack.duplicate();
      expect(stack.length).toEqual(3);
      expect(stack.pop()).toEqual(42);
      expect(stack.pop()).toEqual(42);
      expect(stack.pop()).toEqual(42);
      expect(stack.length).toEqual(0);
    });

    it('should work when there is two element', function () {
      var stack = new yaja.Stack();
      stack.push(42);
      stack.push(13);
      stack.duplicate();
      stack.duplicate();
      expect(stack.length).toEqual(4);
      expect(stack.pop()).toEqual(13);
      expect(stack.pop()).toEqual(13);
      expect(stack.pop()).toEqual(13);
      expect(stack.pop()).toEqual(42);
      expect(stack.length).toEqual(0);
    });
  });
});

describe('yaja.Queue', function () {

  describe('push method', function () {
    it('should increment length', function () {
      var queue = new yaja.Queue();
      expect(queue.length).toEqual(0);
      queue.push(1);
      expect(queue.length).toEqual(1);
      queue.push(10);
      expect(queue.length).toEqual(2);
      queue.push(100);
      expect(queue.length).toEqual(3);
    });
  });

  describe('pop method', function () {
    it('should work when there is one element', function () {
      var queue = new yaja.Queue();
      queue.push(42);
      expect(queue.pop()).toEqual(42);
      expect(queue.length).toEqual(0);
    });

    it('should work when there is two element', function () {
      var queue = new yaja.Queue();
      queue.push(42);
      queue.push(13);
      expect(queue.pop()).toEqual(42);
      expect(queue.pop()).toEqual(13);
      expect(queue.length).toEqual(0);
    });

    it('should work when many elements are pushed and popped', function () {
      var queue = new yaja.Queue(),
          reference = [],
          n = 100;
      for (var i = 0; i < n * n; ++i) {
        reference.push(i * i - i + 1);
      }
      for (var i = 0; i < n; ++i) {
        for (var j = 0; j < n; ++j) {
          queue.push(reference[i * n + j]);
        }
        for (var j = 0; j < n; ++j) {
          expect(queue.pop()).toEqual(reference[i * n + j]);
          expect(queue.length).toEqual(n - j - 1);
        }
      }
    });
  });

  describe('duplicate method', function () {
    it('should work when there is one element', function () {
      var queue = new yaja.Queue();
      queue.push(42);
      queue.duplicate();
      queue.duplicate();
      expect(queue.length).toEqual(3);
      expect(queue.pop()).toEqual(42);
      expect(queue.pop()).toEqual(42);
      expect(queue.pop()).toEqual(42);
      expect(queue.length).toEqual(0);
    });

    it('should work when there is two element', function () {
      var queue = new yaja.Queue();
      queue.push(42);
      queue.push(13);
      queue.duplicate();
      queue.duplicate();
      expect(queue.length).toEqual(4);
      expect(queue.pop()).toEqual(42);
      expect(queue.pop()).toEqual(42);
      expect(queue.pop()).toEqual(42);
      expect(queue.pop()).toEqual(13);
      expect(queue.length).toEqual(0);
    });
  });
});
