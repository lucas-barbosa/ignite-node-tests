import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import bcrypt from 'bcryptjs';

let createUserUsecase: CreateUserUseCase;
let userRepository: InMemoryUsersRepository;

const makeUser = () => ({
  name: 'username',
  email: 'user@gmail.com',
  password: 'password'
});

describe('Create User: usecase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    createUserUsecase = new CreateUserUseCase(userRepository);
  });

  it('should throw an error if email has already used', async () => {
    const user = makeUser();

    await createUserUsecase.execute(user);

    await expect(createUserUsecase.execute(user))
      .rejects
      .toBeInstanceOf(CreateUserError);
  });

  it('should create a user', async () => {
    const userData = makeUser();

    const user = await createUserUsecase.execute(userData);

    expect(user).toHaveProperty('id');
    expect(user.email).toBe(userData.email);
    expect(user.name).toBe(userData.name);
  });

  it('should hash password before save', async () => {
    jest.spyOn(bcrypt, 'hash');
    const userData = makeUser();

    await createUserUsecase.execute(userData);
    expect(bcrypt.hash).toBeCalledWith(userData.password, 8);
  });

  it('should call repository with hash instead of plain password', async () => {
    jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed-password'));
    jest.spyOn(userRepository, 'create');

    const userData = makeUser();

    await createUserUsecase.execute(userData);

    expect(userRepository.create).toBeCalledWith({
      ...userData,
      password: 'hashed-password'
    });
  })
});
