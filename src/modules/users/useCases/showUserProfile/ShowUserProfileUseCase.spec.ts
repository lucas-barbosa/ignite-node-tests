import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: IUsersRepository;
let showUserProfile: ShowUserProfileUseCase;
let createUser: CreateUserUseCase;

const makeUser = () => ({
  name: 'username',
  email: 'user@gmail.com',
  password: 'password'
});

describe('Show User Profile: usecase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfile = new ShowUserProfileUseCase(usersRepository);
    createUser = new CreateUserUseCase(usersRepository);
  });

  it('should return an error if user not found', async () => {
    await expect(showUserProfile.execute('invalid-user-id'))
      .rejects
      .toBeInstanceOf(ShowUserProfileError);
  });

  it('should return user profile', async () => {
    const userData = makeUser();
    const user = await createUser.execute(userData);
    const userProfile = await showUserProfile.execute(user.id as string);

    expect(userProfile.id).toBe(user.id);
    expect(userProfile.name).toBe(user.name);
    expect(userProfile.email).toBe(user.email);
  });

  it('should call repository with user id', async () => {
    jest.spyOn(usersRepository, 'findById');

    const userData = makeUser();
    const user = await createUser.execute(userData);
    await showUserProfile.execute(user.id as string);

    expect(usersRepository.findById).toBeCalledTimes(1);
    expect(usersRepository.findById).toBeCalledWith(user.id);
  })
});
